<?php
declare(strict_types=1);

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('Cache-Control: no-store, private');

function json_response(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function require_same_origin(): void
{
    if ($_SERVER['REQUEST_METHOD'] === 'GET') return;
    $marker = $_SERVER['HTTP_X_ZERAO_REQUEST'] ?? '';
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $host = $_SERVER['HTTP_HOST'] ?? '';
    $originHost = parse_url($origin, PHP_URL_HOST);
    if ($marker !== 'portal' || ($originHost && strcasecmp((string) $originHost, preg_replace('/:\d+$/', '', $host)) !== 0)) {
        json_response(['error' => 'Requisição não autorizada.'], 403);
    }
}

function private_directory(): string
{
    $documentRoot = rtrim((string) ($_SERVER['DOCUMENT_ROOT'] ?? dirname(__DIR__)), DIRECTORY_SEPARATOR);
    $directory = dirname($documentRoot) . DIRECTORY_SEPARATOR . 'zerao_private';
    if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
        json_response(['error' => 'Não foi possível preparar o armazenamento privado.'], 500);
    }
    $photos = $directory . DIRECTORY_SEPARATOR . 'shape';
    if (!is_dir($photos) && !mkdir($photos, 0700, true) && !is_dir($photos)) {
        json_response(['error' => 'Não foi possível preparar a galeria privada.'], 500);
    }
    return $directory;
}

function read_json_file(string $path, array $fallback): array
{
    if (!is_file($path)) return $fallback;
    $handle = fopen($path, 'rb');
    if (!$handle) return $fallback;
    flock($handle, LOCK_SH);
    $contents = stream_get_contents($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    $decoded = json_decode((string) $contents, true);
    return is_array($decoded) ? $decoded : $fallback;
}

function write_json_file(string $path, array $value): void
{
    $temporary = $path . '.' . bin2hex(random_bytes(6)) . '.tmp';
    $encoded = json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($encoded === false || file_put_contents($temporary, $encoded, LOCK_EX) === false) {
        @unlink($temporary);
        json_response(['error' => 'Não foi possível salvar os dados.'], 500);
    }
    @chmod($temporary, 0600);
    if (!rename($temporary, $path)) {
        @unlink($temporary);
        json_response(['error' => 'Não foi possível concluir o salvamento.'], 500);
    }
}

// Login do portal: a senha fica só como hash em zerao_private/auth.json; cada aparelho logado recebe um token
// aleatório em cookie HttpOnly, guardado no servidor apenas como hash.
const SESSION_COOKIE = 'zerao_session';
const SESSION_DAYS = 90;
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

function read_auth(string $path): array
{
    $auth = read_json_file($path, []);
    $now = time();
    $auth['tokens'] = array_values(array_filter($auth['tokens'] ?? [], static fn(array $token): bool => ($token['expires'] ?? 0) > $now));
    $auth['attempts'] = array_filter($auth['attempts'] ?? [], static fn(array $attempt): bool => ($attempt['until'] ?? 0) > $now || ($attempt['last'] ?? 0) > $now - LOCK_MINUTES * 60);
    return $auth;
}

function cookie_path(): string
{
    $path = rtrim(str_replace('\\', '/', dirname((string) ($_SERVER['SCRIPT_NAME'] ?? '/'))), '/');
    return $path . '/';
}

function set_session_cookie(string $value, int $expires): void
{
    setcookie(SESSION_COOKIE, $value, [
        'expires' => $expires,
        'path' => cookie_path(),
        'secure' => ($_SERVER['HTTPS'] ?? '') !== '' && ($_SERVER['HTTPS'] ?? '') !== 'off',
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
}

function is_logged_in(array $auth): bool
{
    $token = (string) ($_COOKIE[SESSION_COOKIE] ?? '');
    if ($token === '') return false;
    $hash = hash('sha256', $token);
    foreach ($auth['tokens'] as $stored) {
        if (hash_equals((string) ($stored['hash'] ?? ''), $hash)) return true;
    }
    return false;
}

function require_login(array $auth): void
{
    if (!is_logged_in($auth)) json_response(['error' => 'Entre para fazer alterações.'], 401);
}

function session_payload(array $auth): array
{
    $needsSetup = empty($auth['hash']);
    // A primeira senha só pode ser criada por quem já passou pela proteção de pasta da Hostinger.
    $canSetup = $needsSetup && (($_SERVER['REMOTE_USER'] ?? $_SERVER['PHP_AUTH_USER'] ?? $_SERVER['REDIRECT_REMOTE_USER'] ?? '') !== '');
    return ['loggedIn' => is_logged_in($auth), 'needsSetup' => $needsSetup, 'canSetup' => $canSetup];
}

require_same_origin();

$privateDir = private_directory();
$stateFile = $privateDir . DIRECTORY_SEPARATOR . 'state.json';
$photosFile = $privateDir . DIRECTORY_SEPARATOR . 'shape.json';
$shapeDir = $privateDir . DIRECTORY_SEPARATOR . 'shape';
$authFile = $privateDir . DIRECTORY_SEPARATOR . 'auth.json';
$action = (string) ($_GET['action'] ?? 'session');
$method = (string) ($_SERVER['REQUEST_METHOD'] ?? 'GET');
$auth = read_auth($authFile);

if ($action === 'session' && $method === 'GET') {
    json_response(session_payload($auth));
}

if ($action === 'login' && $method === 'POST') {
    $payload = json_decode((string) file_get_contents('php://input'), true);
    $password = is_array($payload) ? (string) ($payload['password'] ?? '') : '';
    $ip = hash('sha256', (string) ($_SERVER['REMOTE_ADDR'] ?? ''));
    $now = time();
    $attempt = $auth['attempts'][$ip] ?? ['count' => 0, 'until' => 0, 'last' => 0];
    if (($attempt['until'] ?? 0) > $now) {
        json_response(['error' => 'Muitas tentativas. Tente de novo em alguns minutos.'], 429);
    }

    $session = session_payload($auth);
    if ($session['needsSetup']) {
        if (!$session['canSetup']) json_response(['error' => 'O login ainda não foi configurado.'], 403);
        if (mb_strlen($password) < 8) json_response(['error' => 'Use uma senha com pelo menos 8 caracteres.'], 422);
        $auth['hash'] = password_hash($password, PASSWORD_DEFAULT);
    } elseif (!password_verify($password, (string) $auth['hash'])) {
        $count = ($attempt['count'] ?? 0) + 1;
        $auth['attempts'][$ip] = ['count' => $count, 'last' => $now, 'until' => $count >= MAX_ATTEMPTS ? $now + LOCK_MINUTES * 60 : 0];
        write_json_file($authFile, $auth);
        usleep(400000);
        json_response(['error' => 'Senha incorreta.'], 401);
    }

    unset($auth['attempts'][$ip]);
    $token = bin2hex(random_bytes(32));
    $expires = $now + SESSION_DAYS * 86400;
    $auth['tokens'][] = ['hash' => hash('sha256', $token), 'expires' => $expires, 'createdAt' => gmdate('c')];
    $auth['tokens'] = array_slice($auth['tokens'], -20);
    write_json_file($authFile, $auth);
    set_session_cookie($token, $expires);
    json_response(['loggedIn' => true]);
}

if ($action === 'logout' && $method === 'POST') {
    $hash = hash('sha256', (string) ($_COOKIE[SESSION_COOKIE] ?? ''));
    $auth['tokens'] = array_values(array_filter($auth['tokens'], static fn(array $token): bool => !hash_equals((string) ($token['hash'] ?? ''), $hash)));
    write_json_file($authFile, $auth);
    set_session_cookie('', 1);
    json_response(['loggedIn' => false]);
}

function read_state_record(string $path): array
{
    $stored = read_json_file($path, []);
    // Formato anterior guardava o estado direto, sem revisão.
    if (!array_key_exists('state', $stored)) return ['rev' => 0, 'state' => $stored];
    return ['rev' => (int) ($stored['rev'] ?? 0), 'state' => is_array($stored['state']) ? $stored['state'] : []];
}

if ($action === 'state' && $method === 'GET') {
    $record = read_state_record($stateFile);
    json_response(['state' => $record['state'], 'rev' => $record['rev']]);
}

if ($action === 'state' && $method === 'PUT') {
    require_login($auth);
    $raw = file_get_contents('php://input');
    if ($raw === false || strlen($raw) > 2_000_000) json_response(['error' => 'Dados acima do limite permitido.'], 413);
    $payload = json_decode($raw, true);
    if (!is_array($payload) || !is_array($payload['state'] ?? null) || !is_int($payload['baseRev'] ?? null)) {
        json_response(['error' => 'Versão antiga do portal. Recarregue a página.'], 409);
    }

    $lock = fopen($stateFile . '.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX)) json_response(['error' => 'Não foi possível salvar os dados.'], 500);
    $record = read_state_record($stateFile);
    if ($payload['baseRev'] !== $record['rev']) {
        flock($lock, LOCK_UN);
        fclose($lock);
        json_response(['error' => 'Há alterações mais recentes de outro aparelho.', 'state' => $record['state'], 'rev' => $record['rev']], 409);
    }
    $allowed = array_intersect_key($payload['state'], array_flip(['portal', 'workout', 'history']));
    $rev = $record['rev'] + 1;
    write_json_file($stateFile, ['rev' => $rev, 'updatedAt' => gmdate('c'), 'state' => $allowed]);
    flock($lock, LOCK_UN);
    fclose($lock);
    json_response(['saved' => true, 'rev' => $rev]);
}

// Daqui em diante tudo é privado: as fotos do shape só aparecem e mudam com login.
if (str_starts_with($action, 'shape')) require_login($auth);

if ($action === 'shapes' && $method === 'GET') {
    $photos = read_json_file($photosFile, []);
    usort($photos, static fn(array $a, array $b): int => strcmp((string) ($b['date'] ?? ''), (string) ($a['date'] ?? '')) ?: strcmp((string) ($b['createdAt'] ?? ''), (string) ($a['createdAt'] ?? '')));
    $safe = array_map(static function (array $photo): array {
        unset($photo['file']);
        return $photo;
    }, $photos);
    json_response(['photos' => $safe]);
}

if ($action === 'shape' && $method === 'POST') {
    if (!isset($_FILES['photo']) || !is_uploaded_file($_FILES['photo']['tmp_name'])) json_response(['error' => 'Escolha uma foto válida.'], 422);
    $upload = $_FILES['photo'];
    if (($upload['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) json_response(['error' => 'O envio da foto não foi concluído.'], 422);
    if (($upload['size'] ?? 0) < 1 || $upload['size'] > 12_000_000) json_response(['error' => 'A foto deve ter no máximo 12 MB.'], 413);

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = (string) $finfo->file($upload['tmp_name']);
    $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    if (!isset($extensions[$mime]) || @getimagesize($upload['tmp_name']) === false) json_response(['error' => 'Use uma imagem JPG, PNG ou WebP.'], 422);

    $date = (string) ($_POST['date'] ?? '');
    $dateObject = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
    if (!$dateObject || $dateObject->format('Y-m-d') !== $date) json_response(['error' => 'Data inválida.'], 422);
    $view = mb_substr(trim((string) ($_POST['view'] ?? 'Outro')), 0, 30);
    $note = mb_substr(trim((string) ($_POST['note'] ?? '')), 0, 160);
    $id = bin2hex(random_bytes(16));
    $filename = $id . '.' . $extensions[$mime];
    $destination = $shapeDir . DIRECTORY_SEPARATOR . $filename;
    if (!move_uploaded_file($upload['tmp_name'], $destination)) json_response(['error' => 'Não foi possível guardar a foto.'], 500);
    @chmod($destination, 0600);

    $photos = read_json_file($photosFile, []);
    $record = ['id' => $id, 'date' => $date, 'view' => $view ?: 'Outro', 'note' => $note, 'mime' => $mime, 'file' => $filename, 'createdAt' => gmdate('c')];
    array_unshift($photos, $record);
    write_json_file($photosFile, array_slice($photos, 0, 1000));
    unset($record['file']);
    json_response(['photo' => $record], 201);
}

if ($action === 'shape' && $method === 'GET') {
    $id = (string) ($_GET['id'] ?? '');
    $photos = read_json_file($photosFile, []);
    $photo = null;
    foreach ($photos as $candidate) {
        if (hash_equals((string) ($candidate['id'] ?? ''), $id)) { $photo = $candidate; break; }
    }
    if (!$photo) json_response(['error' => 'Foto não encontrada.'], 404);
    $path = $shapeDir . DIRECTORY_SEPARATOR . basename((string) $photo['file']);
    if (!is_file($path)) json_response(['error' => 'Arquivo não encontrado.'], 404);
    header('Content-Type: ' . $photo['mime']);
    header('Content-Length: ' . filesize($path));
    header('Content-Disposition: inline; filename="shape-' . $photo['date'] . '.' . pathinfo($path, PATHINFO_EXTENSION) . '"');
    readfile($path);
    exit;
}

if ($action === 'shape' && $method === 'DELETE') {
    $id = (string) ($_GET['id'] ?? '');
    $photos = read_json_file($photosFile, []);
    $remaining = [];
    $removed = null;
    foreach ($photos as $photo) {
        if (!$removed && hash_equals((string) ($photo['id'] ?? ''), $id)) $removed = $photo;
        else $remaining[] = $photo;
    }
    if (!$removed) json_response(['error' => 'Foto não encontrada.'], 404);
    $path = $shapeDir . DIRECTORY_SEPARATOR . basename((string) $removed['file']);
    if (is_file($path) && !unlink($path)) json_response(['error' => 'Não foi possível remover a foto.'], 500);
    write_json_file($photosFile, $remaining);
    json_response(['removed' => true]);
}

json_response(['error' => 'Rota não encontrada.'], 404);

