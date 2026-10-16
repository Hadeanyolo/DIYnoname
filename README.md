# DIYnoname

适用于官方版无名杀的自定义武将扩展下载源，包含蔡琰、玄德、黄盖、张宁。

## 手机端安装

1. 进入无名杀「选项 / 设置 → 通用 → 添加获取扩展地址」。
2. 添加下载源：

   `https://raw.githubusercontent.com/Hadeanyolo/DIYnoname/main/`

3. 将「获取扩展地址」切换至该地址。
4. 进入「扩展 → 获取扩展」，选择 **DIYnoname** 下载，完成后重启游戏。

## 手动更新

以后更新扩展代码或图片时，提交到本仓库的 `main` 分支，并同步修改根目录 `catalog.js`、`DIYnoname/info.json` 及 `DIYnoname/extension.js` 里的版本号。然后回到游戏的「获取扩展」页面，点击「更新扩展」。无需手动下载 ZIP。

## 目录

- `catalog.js`：无名杀扩展下载目录。
- `DIYnoname/extension.js`：扩展入口（包含武将、技能配置）。
- `DIYnoname/info.json`：扩展信息。
- `DIYnoname/*.jpg`：4 名武将的立绘。

注意：原扩展「1.11.6DIY」与新扩展「DIYnoname」属于不同扩展名。如果手机端仍装有旧扩展，请先禁用或卸载旧扩展，避免重复加载同名武将/技能。

当前提交未包含自定义音频文件，因此已移除源扩展中指向缺失音频的引用；原来的技能效果未改动。
