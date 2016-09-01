/**
 * util
 */
!function (win) {
    "use strict";

    var $ = win.$,
        util = win.YDUI.util = win.YDUI.util || {},
        doc = win.document;

    /**
     * 日期格式化
     * @param format 日期格式 {%d}天{%h}时{%m}分{%s}秒{%f}毫秒
     * @param time 单位 毫秒
     * @returns {string}
     */
    util.timestampTotime = function (format, time) {
        var t = {},
            floor = Math.floor;

        var checkTime = function (i) {
            return i < 10 ? '0' + i : i;
        };

        t.f = time % 1000;
        time = floor(time / 1000);
        t.s = time % 60;
        time = floor(time / 60);
        t.m = time % 60;
        time = floor(time / 60);
        t.h = time % 24;
        t.d = floor(time / 24);

        var ment = function (a) {
            return '$1' + checkTime(a) + '$2';
        };

        format = format.replace(/\{([^{]*?)%d(.*?)\}/g, ment(t.d));
        format = format.replace(/\{([^{]*?)%h(.*?)\}/g, ment(t.h));
        format = format.replace(/\{([^{]*?)%m(.*?)\}/g, ment(t.m));
        format = format.replace(/\{([^{]*?)%s(.*?)\}/g, ment(t.s));
        format = format.replace(/\{([^{]*?)%f(.*?)\}/g, ment(t.f));

        return format;
    };

    /**
     * js倒计时 TODO 有问题 哈哈哈哈哈哈
     * @param format 时间格式 {%d}天{%h}时{%m}分{%s}秒{%f}毫秒
     * @param time 时间 毫秒
     * @param callback(ret) 倒计时结束回调函数 ret 时间字符 ；ret == '' 则倒计时结束
     * DEMO: YDUI.util.countdown('{%d}天{%h}时{%m}分{%s}秒{%f}毫秒', 60000, function(ret){ console.log(ret); });
     */
    util.countdown = function (format, time, callback) {
        var that = this, tm = new Date().getTime();
        var timer = setInterval(function () {
            var a = new Date().getTime();
            var l_time = time - a + tm;
            if (l_time > 0) {
                callback(that.timestampTotime(format, l_time));
            } else {
                clearInterval(timer);
                $.type(callback) == 'function' && callback('');
            }
        }, 50);
    };

  // util.countdown = function (format, time, callback) {
  //       var c = time * 1000;
  //       var timer = setInterval(function () {
  //           var l_time = c - new Date().getTime();
  //           if (l_time > 0) {
  //               callback(util.timestampTotime(format, l_time));
  //           } else {
  //               clearInterval(timer);
  //               $.type(callback) == 'function' && callback('');
  //           }
  //       }, 10);
  //   };
    
    /**
     * js 加减乘除
     * @param arg1 数值1
     * @param arg2 数值2
     * @param op 操作符string 【+ - * /】
     * @returns {Object} arg1 与 arg2运算的精确结果
     */
    util.calc = function (arg1, arg2, op) {
        var ra = 1, rb = 1, m;

        try {
            ra = arg1.toString().split('.')[1].length;
        } catch (e) {
        }
        try {
            rb = arg2.toString().split('.')[1].length;
        } catch (e) {
        }
        m = Math.pow(10, Math.max(ra, rb));

        switch (op) {
            case '+':
            case '-':
                arg1 = Math.round(arg1 * m);
                arg2 = Math.round(arg2 * m);
                break;
            case '*':
                ra = Math.pow(10, ra);
                rb = Math.pow(10, rb);
                m = ra * rb;
                arg1 = Math.round(arg1 * ra);
                arg2 = Math.round(arg2 * rb);
                break;
            case '/':
                arg1 = Math.round(arg1 * m);
                arg2 = Math.round(arg2 * m);
                m = 1;
                break;
        }
        try {
            var result = eval('(' + '(' + arg1 + ')' + op + '(' + arg2 + ')' + ')/' + m);
        } catch (e) {
        }
        return result;
    };

    /**
     * 读取图片文件 并返回图片的DataUrl
     * @param obj
     * @param callback
     */
    util.getImgBase64 = function (obj, callback) {
        var that = this, dataimg = '', file = obj.files[0];
        if (!file)return;
        if (!/image\/\w+/.test(file.type)) {
            that.tipMes('请上传图片文件', 'error');
            return;
        }
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            dataimg = this.result;
            $.type(callback) === 'function' && callback(dataimg);
        };
    };

    /**
     * 获取地址栏参数
     * @param name
     * @returns {*}
     */
    util.getQueryString = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"),
            r = win.location.search.substr(1).match(reg),
            qs = '';
        if (r != null)qs = decodeURIComponent(r[2]);
        return qs;
    };

    /**
     * 序列化
     * @param value
     * @returns {string}
     */
    util.serialize = function (value) {
        if ($.type(value) === 'string') return value;
        return JSON.stringify(value);
    };

    /**
     * 反序列化
     * @param value
     * @returns {*}
     */
    util.deserialize = function (value) {
        if ($.type(value) !== 'string') return undefined;
        try {
            return JSON.parse(value);
        } catch (e) {
            return value || undefined;
        }
    };

    /**
     * 本地存储
     */
    util.localStorage = function () {
        return storage(win.localStorage);
    }();

    /**
     * Session存储
     */
    util.sessionStorage = function () {
        return storage(win.sessionStorage);
    }();

    /**
     * Cookie
     * @type {{get, set}}
     */
    util.cookie = function () {
        return {
            /**
             * 获取 Cookie
             * @param  {String} name
             * @return {String}
             */
            get: function (name) {
                var m = doc.cookie.match('(?:^|;)\\s*' + name + '=([^;]*)');
                return (m && m[1]) ? decodeURIComponent(m[1]) : '';
            },
            /**
             * 设置 Cookie
             * @param {String}  name 名称
             * @param {String}  val 值
             * @param {Number} expires 单位（秒）
             * @param {String}  domain 域
             * @param {String}  path 所在的目录
             * @param {Boolean} secure 跨协议传递
             */
            set: function (name, val, expires, domain, path, secure) {
                var text = String(encodeURIComponent(val)),
                    date = expires;

                // 从当前时间开始，多少小时后过期
                if ($.type(date) === 'number') {
                    date = new Date();
                    date.setTime(date.getTime() + expires * 1000);
                }

                date instanceof Date && (text += '; expires=' + date.toUTCString());

                !!domain && (text += '; domain=' + domain);

                text += '; path=' + (path || '/');

                secure && (text += '; secure');

                doc.cookie = name + '=' + text;
            }
        }
    }();

    /**
     * HTML5存储
     */
    function storage(ls) {
        var _util = util;
        return {
            set: function (key, value) {
                ls.setItem(key, _util.serialize(value));
            },
            get: function (key) {
                return _util.deserialize(ls.getItem(key));
            },
            remove: function (key) {
                ls.removeItem(key);
            },
            clear: function () {
                ls.clear();
            }
        };
    }

}(window);