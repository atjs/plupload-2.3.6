# plupload-2.3.6

批量上传中需要先到应用服务器拿到上传参数，然后异步上传到又拍上

在实际开发过程中，使用原生的 plupload-2.3.6存在一些参数设置不正确问题

排查后，发现是 plupload-2.3.6上传队列中对单个文件对象无法设置请求参数导致

为解决这问题，此版本对该组件进行了优化，主要是增加了对单个文件对象设置请求参数和锁的概念


优化关键词 `setOption` `lock` `unlock`

详细请参考 demo.js