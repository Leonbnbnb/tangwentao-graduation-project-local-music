听见之间 | 毕业设计网站 · 本地演示版

【怎么启动】
双击 start-site.cmd
  会自动用项目自带的 PHP 起一个本地服务，浏览器打开 http://127.0.0.1:8080/index.php
  关闭那个黑窗口即可停止服务
  注意：不要重复双击，8080 端口被占用时会起不来

【完整功能需要走 index.php】
评论、点赞、本人删除、后台统计都依赖 PHP，用这个地址访问才有：
  前台   http://127.0.0.1:8080/index.php
  后台   http://127.0.0.1:8080/admin.php   账号 admin   密码 TWT@2026!（导航栏右侧“后台管理”直接进）
直接双击 index.html 也能看页面，但评论和后台不可用。

【页面】
index.html / index.php   首页与三位音乐人入口
music.html               作品总览（本地音频播放）
artist-shan-yichun.html  单依纯人物档案
artist-song-yuqi.html    宋雨琦人物档案
artist-li-ronghao.html   李荣浩人物档案
about.html               关于单依纯
concert.html             现场演出
awards.html              荣誉记录
fans.html                歌迷空间
media.html               声音观察
admin.html / admin.php   后台管理

【数据与资源】
data/comments.json       评论数据（PHP 读写，带排他锁）
media/audio/*.m4a        本地试听音频
media/*.mp4              现场影像
covers/ images/          封面与人像

【录屏演示建议顺序】
首页 → 音乐人阵容 → 人物档案 → 作品总览（放出声）→ 现场/荣誉/声音观察 → 歌迷空间（发评论/点赞/删除）→ 后台（登录看统计）→ F12 切 390 宽看移动端


【在 phpStudy 里跑（推荐）】
项目已复制到 D:\phpstudy_pro\WWW\tingjian
打开 phpStudy → 启动 Nginx（或 Apache）+ PHP → 浏览器访问：
  前台  http://localhost/tingjian/index.php
  后台  http://localhost/tingjian/admin.php   账号 admin   密码 TWT@2026!
修改文件后直接刷新页面即可，Nginx 不需要重启。
