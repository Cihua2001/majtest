是的，直接双击打开会有问题，原因是：

CORS 限制 - 浏览器禁止 file:// 协议加载其他本地文件
Canvas 安全 - 页面导出会被阻止
外部 CDN - 之前尝试加载 cdn.jsdelivr.net 也被阻止
最简单的解决方法：在文件夹所在目录运行一个命令：

bash
# 方法1：Python（推荐）
python -m http.server

# 方法2：Node.js
npx http-server
然后访问 http://localhost:8000/htmls/你的文件.html

这样每次只需几秒钟，比修改各种路径更省事！