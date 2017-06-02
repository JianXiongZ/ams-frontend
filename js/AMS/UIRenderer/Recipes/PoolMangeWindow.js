AMS.UIRenderer.Recipes.PoolMangeWindow = function () {
    let ret = '<div id="ams-poolmanage-window" class="modal modal-fixed-footer">' +
    '<div class="modal-content">' +
        '<a href="#" onclick="" class="modal-action modal-close"><i class="material-icons right black-text">&#xE14C;</i></a>' +
        '<a href="#" onclick="AMS_poolmanagement_iplist()" class="modal-action"><i class="material-icons right black-text">刷新</i></a>' +
        '<h4>矿池管理</h4>' +
        '<div class="row">' +
            '<form class="col s12">' +
                '<div class="row">' +
                    '<table id="tb1">' +
                    '<thead>' +
                    '<tr>' +
                        '<th data-field="ams-mainpage-badmachines-table-th-ip_list">Target</th>' +
                        '<th data-field="ams-mainpage-badmachines-table-th-run_time">运行时间</th>' +
                        '<th data-field="ams-mainpage-badmachines-table-th-pool">矿池</th>' +
                        '<th data-field="ams-mainpage-badmachines-table-th-worker">矿工</th>' +
                        '<th data-field="ams-mainpage-badmachines-table-th-miner_number">机器数量</th>' +
                        '<th data-field="ams-mainpage-badmachines-table-th-miner_type">机器种类</th>' +
                        '<th data-field="ams-mainpage-badmachines-table-th-GHS">实际算力</th>' +
                        '<th data-field="ams-mainpage-badmachines-table-th-GHSavg">平均算力</th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody id="ams-mainpage-badmachines-table-tbody">' +
                    '<!--<tr>-->' +
                    '<!--<td>192.168.1.233:4028</td>-->' +
                    '<!--<td>0</td>-->' +
                    '<!--<td>1</td>-->' +
                    '<!--<td>喵喵喵</td>-->' +
                    '<!--</tr>-->' +
                   '</tbody>' +
                '</table>' +
                '</div>' +
            '</form>' +
        '</div>' +
    '</div>' +
    '<div class="modal-footer">' +
        '<h6 class="waves-effect waves-red">所选IP的机器总数量为：</h6>' +
        '<a href="#" class="modal-close waves-effect waves-red btn-flat">取消</a>' +
        '<a href="#ams-poolmodified-window" class="waves-effect waves-green btn-flat">更改</a>' +
    '</div>'  
    '<script language="javascript" type="text/javascript">' +
        'new TableSorter("tb1");' +
    '</script>' 
    ;


    let postrender_func = function () {

        $('#ams-poolmanage-window').modal(AMS.UIRenderer.Templates.ModalAttributes.Dialog.Small);
    };

    return [ret, postrender_func];
};