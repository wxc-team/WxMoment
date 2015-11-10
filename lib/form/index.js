/**
 * 活动表单（预约、试驾、预购等）
 */

function Form(params, url) {
    this.data = {
        action: 'submit'
    }
    $.extend(this.data, params);

    this.url = url || '//mp.weixin.qq.com/promotion/cgi-bin/questionnaire';

}


Form.prototype.submit = function (sucFn, errFn) {
    $.ajax({
        url: this.url,
        type: 'POST',
        data: this.data,
        dataType: 'json',
        beforeSend: function(xhr) {
            xhr.withCredentials = true;
        },
        success: function(res) {
            if (res.base_resp.ret == 0) {
                sucFn(res);
            } else {
                errFn(res);
            }
        },
        error: function(err) {
            errFn(err);
        }
    });
};

module.exports = Form;




