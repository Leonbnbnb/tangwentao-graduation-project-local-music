<?php
declare(strict_types=1);

session_start();

$username = 'admin';
$passwordHash = '$2y$10$hOhDX4dFpDZ2vlRGkUStvOxZdZ4jhSq/DieSo7FCmuc.FH8bKWk2G';
$error = '';

$dataFile = __DIR__ . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'comments.json';

$artistNames = [
    'shan-yichun' => '单依纯',
    'song-yuqi' => '宋雨琦',
    'li-ronghao' => '李荣浩',
];

function shorten(string $text, int $limit): string
{
    $text = trim($text);
    if (preg_match('/^.{0,' . $limit . '}/us', $text, $m)) {
        return $m[0] . (preg_match('/^.{' . $limit . '}.+/us', $text) ? '…' : '');
    }
    return substr($text, 0, $limit);
}

function read_store(string $file): array
{
    $raw = is_file($file) ? (string) file_get_contents($file) : '';
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function write_store(string $file, array $data): void
{
    $handle = fopen($file, 'c+');
    if ($handle === false) {
        return;
    }
    if (flock($handle, LOCK_EX)) {
        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
        fflush($handle);
        flock($handle, LOCK_UN);
    }
    fclose($handle);
}

if (isset($_GET['logout'])) {
    $_SESSION = [];
    session_destroy();
    header('Location: admin.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    $submittedUser = trim((string) ($_POST['username'] ?? ''));
    $submittedPassword = (string) ($_POST['password'] ?? '');
    if (hash_equals($username, $submittedUser) && password_verify($submittedPassword, $passwordHash)) {
        session_regenerate_id(true);
        $_SESSION['admin_authenticated'] = true;
        header('Location: admin.php');
        exit;
    }
    $error = '账号或密码错误，请重试。';
}

$authenticated = !empty($_SESSION['admin_authenticated']);

if ($authenticated && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_id'])) {
    $deleteId = (string) $_POST['delete_id'];
    $store = read_store($dataFile);
    foreach ($store as $artistKey => $items) {
        if (!is_array($items)) {
            continue;
        }
        $store[$artistKey] = array_values(array_filter($items, static function ($item) use ($deleteId) {
            return (string) ($item['id'] ?? '') !== $deleteId;
        }));
    }
    write_store($dataFile, $store);
    header('Location: admin.php?deleted=1');
    exit;
}

$comments = $authenticated ? read_store($dataFile) : [];

$total = 0;
$totalLikes = 0;
$artistTotals = [];
foreach ($comments as $artist => $items) {
    $items = is_array($items) ? $items : [];
    $artistTotals[$artist] = count($items);
    $total += count($items);
    foreach ($items as $item) {
        $totalLikes += (int) ($item['baseLikes'] ?? 0) + count((array) ($item['likedBy'] ?? []));
    }
}
?><!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>后台管理 | 听见之间</title>
<link rel="stylesheet" href="css/style.css">
<style>
.admin-page { min-height: 100svh; background: var(--canvas); }
.admin-wrap { width: min(calc(100% - 32px), 1080px); margin: 0 auto; padding: 56px 0 90px; }
.admin-panel { border: 1px solid #e6ebe5; border-radius: 18px; background: #fff; padding: clamp(22px, 3.4vw, 40px); box-shadow: 0 22px 50px -40px rgba(18,20,19,.6); }
.admin-form { display: grid; gap: 14px; max-width: 400px; margin-top: 24px; }
.admin-form label { font-size: 12px; letter-spacing: .04em; color: #4b5350; font-weight: 700; }
.admin-form input { width: 100%; height: 48px; padding: 0 14px; border: 1px solid #dfe5de; border-radius: 12px; background: #f8faf7; transition: border-color .18s ease, box-shadow .18s ease, background-color .18s ease; }
.admin-form input:focus { background: #fff; border-color: var(--coral); outline: none; box-shadow: 0 0 0 3px rgba(230,84,67,.16); }
.admin-form .btn { justify-self: stretch; justify-content: center; border-radius: 999px; margin-top: 4px; cursor: pointer; }
.admin-error { margin-top: 16px; color: var(--coral-dark); font-weight: 700; font-size: 13px; }
.admin-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
.admin-top h1 { font-size: clamp(26px, 3vw, 38px); letter-spacing: -.02em; }
.admin-logout { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; border: 1px solid #e2e8e1; border-radius: 999px; color: #4b5350; font-size: 13px; font-weight: 700; text-decoration: none; transition: border-color .16s ease, color .16s ease; }
.admin-logout:hover { border-color: var(--coral); color: var(--coral); }
.admin-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 28px 0 8px; }
.admin-stat { padding: 18px 20px; border: 1px solid #eef2ec; border-radius: 14px; background: #fbfcfa; }
.admin-stat strong { display: block; font-size: 30px; line-height: 1.1; letter-spacing: -.02em; }
.admin-stat span { color: #8b948d; font-size: 12px; }
.admin-table { width: 100%; border-collapse: collapse; font-size: 13.5px; margin-top: 18px; }
.admin-table th { text-align: left; font-size: 12px; letter-spacing: .04em; color: #8b948d; font-weight: 700; padding: 10px 8px; border-bottom: 1px solid #eef2ec; }
.admin-table td { padding: 12px 8px; border-bottom: 1px solid #f3f6f2; vertical-align: top; }
.admin-table tr:hover td { background: #fafcf9; }
.admin-del { border: 1px solid #f0dcd8; border-radius: 999px; background: #fff; color: var(--coral); font-size: 12px; font-weight: 700; padding: 5px 12px; cursor: pointer; }
.admin-del:hover { background: rgba(230,84,67,.08); }
.admin-note { margin-top: 14px; font-size: 12.5px; color: #8b948d; }
.admin-flash { margin: 14px 0 0; padding: 10px 14px; border-radius: 12px; background: rgba(230,84,67,.08); color: var(--coral-dark); font-size: 13px; font-weight: 700; }
@media (max-width: 720px) {
  .admin-stats { grid-template-columns: repeat(2, 1fr); }
  .admin-table { display: block; overflow-x: auto; white-space: nowrap; }
}
</style>
</head>
<body class="admin-page">
<nav class="site-nav" aria-label="主导航">
  <div class="container nav-shell">
    <a class="brand" href="index.php" aria-label="听见之间首页"><span class="brand-mark" aria-hidden="true">听</span><span>听见之间</span></a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-menu"><span aria-hidden="true">☰</span><span class="sr-only">打开导航</span></button>
    <ul class="nav-links" id="site-menu">
      <li><a href="index.php">首页</a></li>
      <li><a href="index.php#artists">音乐人阵容</a></li>
      <li><a href="music.html">作品总览</a></li>
      <li><a href="fans.html">歌迷空间</a></li>
      <li><a href="media.html">声音观察</a></li>
      <li><a href="admin.php" class="nav-admin">后台管理</a></li>
    </ul>
  </div>
</nav>

<main class="admin-wrap">
<?php if (!$authenticated): ?>
  <section class="admin-panel" aria-labelledby="login-title">
    <p class="eyebrow">ADMIN CONSOLE</p>
    <h1 id="login-title">后台登录</h1>
    <p class="section-heading-p">登录后查看站内评论数据，按歌手查看留言数量，并可删除不当内容。</p>
    <form class="admin-form" method="post" autocomplete="on">
      <input type="hidden" name="login" value="1">
      <div><label for="username">账号</label><input id="username" name="username" type="text" autocomplete="username" required></div>
      <div><label for="password">密码</label><input id="password" name="password" type="password" autocomplete="current-password" required></div>
      <button class="btn" type="submit">登录后台 <span aria-hidden="true">→</span></button>
    </form>
    <?php if ($error !== ''): ?><p class="admin-error" role="alert"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
  </section>
<?php else: ?>
  <section class="admin-panel" aria-labelledby="dashboard-title">
    <div class="admin-top">
      <div>
        <p class="eyebrow">ADMIN CONSOLE</p>
        <h1 id="dashboard-title">评论管理</h1>
        <p class="section-heading-p">欢迎回来，<?= htmlspecialchars($username, ENT_QUOTES, 'UTF-8') ?>。下面是本站当前的评论数据。</p>
      </div>
      <a class="admin-logout" href="admin.php?logout=1">退出登录 ↗</a>
    </div>

    <?php if (isset($_GET['deleted'])): ?><p class="admin-flash" role="status">已删除该条评论。</p><?php endif; ?>

    <div class="admin-stats">
      <div class="admin-stat"><strong><?= $total ?></strong><span>评论总数</span></div>
      <div class="admin-stat"><strong><?= $totalLikes ?></strong><span>点赞总数</span></div>
      <div class="admin-stat"><strong><?= $artistTotals['shan-yichun'] ?? 0 ?></strong><span>单依纯</span></div>
      <div class="admin-stat"><strong><?= ($artistTotals['song-yuqi'] ?? 0) + ($artistTotals['li-ronghao'] ?? 0) ?></strong><span>宋雨琦 · 李荣浩</span></div>
    </div>

    <?php if ($total === 0): ?>
      <p class="admin-note">暂无评论数据。</p>
    <?php else: ?>
      <table class="admin-table">
        <thead>
          <tr><th>歌手</th><th>昵称</th><th>内容</th><th>时间</th><th>点赞</th><th>操作</th></tr>
        </thead>
        <tbody>
          <?php foreach ($comments as $artist => $items): ?>
            <?php foreach ((array) $items as $comment): ?>
              <tr>
                <td><?= htmlspecialchars($artistNames[$artist] ?? $artist, ENT_QUOTES, 'UTF-8') ?></td>
                <td><?= htmlspecialchars((string) ($comment['name'] ?? ''), ENT_QUOTES, 'UTF-8') ?></td>
                <td><?= htmlspecialchars(shorten((string) ($comment['text'] ?? ''), 46), ENT_QUOTES, 'UTF-8') ?></td>
                <td><?= htmlspecialchars((string) ($comment['date'] ?? ''), ENT_QUOTES, 'UTF-8') ?></td>
                <td><?= (int) ($comment['baseLikes'] ?? 0) + count((array) ($comment['likedBy'] ?? [])) ?></td>
                <td>
                  <form method="post" onsubmit="return confirm('确定删除这条评论吗？');">
                    <input type="hidden" name="delete_id" value="<?= htmlspecialchars((string) ($comment['id'] ?? ''), ENT_QUOTES, 'UTF-8') ?>">
                    <button class="admin-del" type="submit">删除</button>
                  </form>
                </td>
              </tr>
            <?php endforeach; ?>
          <?php endforeach; ?>
        </tbody>
      </table>
      <p class="admin-note">数据保存在 data/comments.json，写入时使用排他文件锁，避免并发覆盖。</p>
    <?php endif; ?>
  </section>
<?php endif; ?>
</main>
<script src="script.js" defer></script>
</body>
</html>


