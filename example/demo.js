

function ImageUploadPreview(picId, $el) {
    // 实例化一个plupload上传对象
    var uploader = new plupload.Uploader({
        // 触发文件选择对话框的按钮，为那个元素id
        browse_button: $el.find('.btn-preview').get(0),
        // 服务器端的上传页面地址
        url: 'http://v0.api.upyun.com/',
        filters: {
            // 文件上传限制
//            mime_types : [
//              { title : "files", extensions : "zip,rar,mp4" }
//            ],
            // 用来限定上传文件的大小，如果文件体积超过了该值，则不能被选取
            max_file_size: "20mb",
            // 是否允许选取重复的文件，为true时表示不允许
            prevent_duplicates: true
        },
        // 是否可以在文件浏览对话框中选择多个文件，true为可以，false为不可以
        multi_selection: false,
        // 为true时将以multipart/form-data的形式来上传文件
        multipart: true,
        // 当发生plupload.HTTP_ERROR错误时的重试次数，为0时表示不重试
        max_retries: 1,
        // 用来指定上传方式，这里指定使用html5方式
        runtimes: 'html5',
        // 指定文件上传时文件域的名称
        file_data_name: 'file',
        max_slots: 1,
        max_upload_slots: 1,
        max_resize_slots: 1
    });

    // 在实例对象上调用init()方法进行初始化
    uploader.init();

    // 请求web直传的参数
    uploader.requestParams = function (file, callback) {
        var data = JSON.parse(JSON.stringify(file));
        $.ajax({
            data: data,
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            dataType: 'jsonp',
            type: 'GET',
            success: function (result, status, xhr) {
                file.unlock();
                typeof callback === 'function' && callback(file, result);
            },
            url: '/index.php?c=image&a=image'
        });
    };

    uploader.bind('FilesAdded', function (uploader, files) {
        // 每个事件监听函数都会传入一些很有用的参数，
        // 我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
        plupload.each(files, function (file, index) {
            // 设置需要编辑的素材ID
            file.picId = picId;
            uploader.requestParams(file, function (file, result) {
                if (result.status) {
                    file.setOption('multipart_params', result.data.params);
                    uploader.setOption('url', result.data.url);
                    // 调用实例对象的start()方法开始上传文件，当然你也可以在其他地方调用该方法
                    uploader.start();
                } else {
                    uploader.removeFile(file);
                    alert(result.msg);
                }
            });
        });
    });

    uploader.bind('UploadProgress', function (uploader, file) {
        // 每个事件监听函数都会传入一些很有用的参数，
        // 我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作

    });

    uploader.bind('FileUploaded', function (uploader, file, responseObject) {

    });

    return uploader;
}