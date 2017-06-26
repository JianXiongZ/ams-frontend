AMS.UIRenderer.Recipes.PoolModifyWindow = function () {

let ret = '<div id="ams-poolmodified-window" class="modal modal-fixed-footer">' +
'<div class="modal-content">' +
'<div class="row">' +
    '<div class="input-field col s6">' +
        '<input id="ams-poolmanage-window-form-pool1url" type="text" placeholder="stratum.xxxxx.com:3333" value="">' +
            '<label for="ams-poolmanage-window-form-pool1url">矿池1URL</label>' +
    '</div>' +
    '<div class="input-field col s3">' +
        '<input id="ams-poolmanage-window-form-pool1user" type="text" placeholder="x741 :)" value="">' +
            '<label for="ams-poolmanage-window-form-pool1user">矿池1用户名</label>' +
    '</div>' +
    '<div class="input-field col s3">' +
        '<input id="ams-poolmanage-window-form-pool1passwd" type="password" placeholder="123" value="">' +
            '<label for="ams-poolmanage-window-form-pool1passwd">矿池1密码</label>' +
    '</div>' +
    '</div>' +

    '<div class="row">' +
    '<div class="input-field col s6">' +
        '<input id="ams-poolmanage-window-form-pool2url" type="text" placeholder="stratum.xxxxx.com:3333" value="">' +
            '<label for="ams-poolmanage-window-form-pool2url">矿池2URL</label>' +
    '</div>' +
    '<div class="input-field col s3">' +
       '<input id="ams-poolmanage-window-form-pool2user" type="text" placeholder="x741 :)" value="">' +
        '<label for="ams-poolmanage-window-form-pool2user">矿池2用户名</label>' +
    '</div>' +
    '<div class="input-field col s3">' +
        '<input id="ams-poolmanage-window-form-pool2passwd" type="password" placeholder="123" value="">' +
        '<label for="ams-poolmanage-window-form-pool2passwd">矿池2密码</label>' +
    '</div>' +
    '</div>' +
    '</div>' +

    '<div class="modal-footer">' +
        '<a href="#" class="modal-close waves-effect waves-red btn-flat">取消</a>' +
        '<a href="#AMS_poolmanagement_poolist()" class="waves-effect waves-green btn-flat">确定</a>' +
    '</div>' +
'</div>'
;
let postrender_func = function () {

        $('#ams-poolmodified-window').modal(AMS.UIRenderer.Templates.ModalAttributes.Dialog.Small);
    };

    return [ret, postrender_func];
};
