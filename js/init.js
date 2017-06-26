(function($){
    $(function(){

        jQuery.fn.extend({
            disable: function(state) {
                return this.each(function() {
                    this.disabled = state;
                });
            }
        });


        AMS.Init();


        var jq_title = $('title');
        $('#ams-mainmenu-header-version-string').text(AMS_Version_WebClient);
        jq_title.text(jq_title.text() + ' v' + AMS_Version_WebClient);

        // Side Navbar Menu Width
        $('.button-collapse').sideNav({
            menuWidth: 245
        });

        var modal_cfg_center_small = {
            dismissible: true,
            opacity: .5,
            in_duration: 300,
            out_duration: 200,
            starting_top: '30%',
            ending_top: '30%'
        };

        var modal_cfg_big_window = {
            dismissible: false,
            opacity: .5,
            in_duration: 300,
            out_duration: 200,
            starting_top: '0%',
            ending_top: '1%'
        };

        var modal_cfg_med_window = {
            dismissible: false,
            opacity: .5,
            in_duration: 300,
            out_duration: 200,
            starting_top: '10%',
            ending_top: '10%'
        };

        var modal_cfg_big_window_dismissible = {
            dismissible: true,
            opacity: .5,
            in_duration: 300,
            out_duration: 200,
            starting_top: '0%',
            ending_top: '1%'
        };

        $('.modal').modal();

        AMS_Windows_Add_MsgBox('ams-window-system-about', '关于', '' +
            '<span class="ams-general-text">Avalon Management System - 阿瓦隆矿机管理系统<br>' +
            '<br>' +
            '前端版本：' + AMS_Version_WebClient + '<br>' +
            '后端版本：' + AMS_Version_Backend + '<br>' +
            '<br>' +
            '版权所有 &copy; 2016-2017 CloudyReimu<br>' +
            '<br>' +
            '本程序为自由软件；您可依据自由软件基金会所发表的GNU通用公共授权条款，对本程序再次发布和/或修改；无论您依据的是本授权的第三版，或（您可选的）任一日后发行的版本。<br>' +
            '本程序是基于使用目的而加以发布，然而不负任何担保责任；亦无对适售性或特定目的适用性所为的默示性担保。详情请参照GNU通用公共授权。<br>' +
            '您应已收到附随于本程序的GNU通用公共授权的副本；如果没有，请参照 <a href="http://www.gnu.org/licenses/">http://www.gnu.org/licenses/</a> 。' +
            '</span>');

        $('#ams-userlogin-window').modal(modal_cfg_center_small);
        $('#ams-userlogout-window').modal(modal_cfg_center_small);
        $('#ams-apisettings-window').modal(modal_cfg_center_small);
        $('#ams-themesettings-window').modal(modal_cfg_center_small);
        $('#ams-fwupgrade-new-window').modal(modal_cfg_center_small);

        $('#ams-supertac-window').modal({
            ready: function(modal, trigger) {
                AMS_SuperRTAC_UpdateStatus();
            },
            complete: function() {
                clearTimeout(t_supertac_UpdateStatus);
            }
        });

        $('#ams-supertac-new-window').modal({
            dismissible: true,
            opacity: .5,
            in_duration: 300,
            out_duration: 200,
            starting_top: '20%',
            ending_top: '20%'
        });
        $('#ams-supertac-scripts-window').modal(modal_cfg_center_small);
        $('#ams-supertac-editor-window').modal(modal_cfg_big_window_dismissible);

        $('#ams-fwupgrade-window').modal({
            dismissible: false,
            opacity: .5,
            in_duration: 300,
            out_duration: 200,
            starting_top: '10%',
            ending_top: '10%',
            ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
                t_FwUpd_UpdateStatus = setTimeout(AMS_FwUpd_UpdateStatus,1000);
            },
            complete: function() {
                clearTimeout(t_FwUpd_UpdateStatus);
            }
        });

        $('#ams-nodesmanage-window').modal();

        $('#ams-poolmanage-window').modal({
            dismissible: true,
            opacity: .5,
            in_duration: 300,
            out_duration: 200,
            starting_top: '20%',
            ending_top: '20%'
        });

        $('#ams-nodedetails-window').modal(modal_cfg_big_window_dismissible);

        $('.dropdown-button').dropdown({
                inDuration: 300,
                outDuration: 225,
                constrain_width: false, // Does not change width of dropdown to that of the activator
                hover: false, // Activate on hover
                gutter: 0, // Spacing from edge
                belowOrigin: true, // Displays dropdown below the button
                alignment: 'left' // Displays dropdown with edge aligned to the left of button
            }
        );

        Chart.defaults.global.tooltips.mode = 'index';
        // Load saved API URL
        __AMS_API_URL = $.jStorage.get("AMS_3_1_Config_API_URL", "/ams/api/ams_cgi.moe");

        // Set API URL of the API settings window
        $("#ams-apisettings-window-form-url").val(__AMS_API_URL);


        // FIXME: Placeholder
        AMS_NavBar_IP_Selector_AppendEntry("192.168.1.0/24");

        // Detect logged in user on page load
        AMS_StartupTask_ProcessLoggedInUser();

        // Realtime clock on navbar
        AMSNavBarClock();

        // Realtime hashrate and alive nodes&modules count on navbar
        AMS_NavBar_MiscInfo_UpdateText();

        var up = getUrlParams();
        console.log(up);

        var nd_ip = up["ip"];
        var nd_port = up["port"];

        if (nd_ip && nd_port) {
            jq_title.text(jq_title.text() + ' - ' + nd_ip+':'+nd_port);
            AMS_NodeDetails_Inline(nd_ip, nd_port, 0);
        } else {
            // Load & auto refresh the charts
            AMS_Chart_HashRate();
            AMS_Chart_NormalNodes();

            // Auto refreshes issues card
            AMS_Issues_Update();

            // Auto refreshes map card
            AMS_Map_Update();
        }

}); // end of document ready
})(jQuery); // end of jQuery name space 喵喵喵