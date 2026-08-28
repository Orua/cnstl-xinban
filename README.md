# 中国星际战队联赛 · 新版页面

这是给 [cnstl.cn](https://cnstl.cn) 用的新前台。原来的 `api.ashx`、数据库、后台都不用动。

## 下载

点这里下载整包（浏览器直接下）：

**https://github.com/Orua/cnstl-xinban/archive/refs/heads/main.zip**

解压后会多一层文件夹 `cnstl-xinban-main`，进去就能看到 `index.html`。

## 用 FTP 传到你的网站

1. 用 FileZilla 在网站里新建目录 `xinban`
2. 把解压出来的文件（`index.html`、`css`、`js` 等）传到 `xinban`
3. 浏览器打开：https://cnstl.cn/xinban/

能看到新首页、能搜战队/选手、能进赛事系统，就成功了。

满意后再决定要不要覆盖正式首页。

**不要覆盖：** `api.ashx`、后台、数据库、`uploadimages`

## 页面会读你原来的接口

`https://cnstl.cn/app/api.ashx`

所以战队、选手、比赛、赛事列表都还是你库里的数据。
