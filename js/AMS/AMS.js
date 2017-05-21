/**
 * Created by root on 16-12-28.
 */

let AMS = {

};


var __AMS_API_URL;
var __AMS_API_Time = Math.floor(Date.now() / 1000);
var __AMS_API_TimeStr = __AMS_API_Time.toString();
var __AMS_CurrentUser_Token = AMS_LocalStorage_GetLoggedInUserToken();

var ams_map_tc = 0;
var ams_map_tr = 0;

var ams_api_connectok_noticed = 0;

function AMS_NavBar_IP_UpdateText(ip) {
    $("#ams-navbar-ip").text(ip);
}

function AMS_NavBar_MiscInfo_UpdateText(){
    $.ajax({
        async: true,
        type: "POST",
        url: __AMS_API_URL,
        data: '{"operation": "glimpse", "data": {}}',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        error : function (data, textStatus, jqXHR) {
            ams_api_connectok_noticed = 0;
            Materialize.toast("API请求失败！请检查您的网络、服务器证书和API地址配置是否正确", 3000);
        }
    }).done(function(data, textStatus, jqXHR){
        var ret = JSON.parse(jqXHR.responseText);
        var retdata = ret.data;

        if (ams_api_connectok_noticed === 0) {
            ams_api_connectok_noticed = 1;
            Materialize.toast("API连接成功 ["+__AMS_API_URL+"]",3000);
        }
        // console.log(jqXHR.responseText);

        var nodescount = retdata.ctls;
        var machinescount = retdata.mods;
        var thashrate_cgm = retdata.mhs / 1000 / 1000 / 1000;
        var thashrate_theo = retdata.mhs_t / 1000 / 1000 / 1000;

        // $.jStorage.set("AMS_3_1_Runtime_API_Time", parsed.result.time);

        $("#ams-navbar-nodescount").text(nodescount.toString());
        $("#ams-navbar-machinescount").text(machinescount.toString());
        $("#ams-navbar-hashrate").text(thashrate_cgm.toFixed(2).toString()+" / "+thashrate_theo.toFixed(2).toString());
    });

    // $.ajax({
    //     async: true,
    //     type: "GET",
    //     url: __AMS_API_URL + "lasttime"
    // }).done(function(data, textStatus, jqXHR){
    //
    //     var parsed = JSON.parse(jqXHR.responseText);
    //     // console.log(jqXHR.responseText);
    //
    //     __AMS_API_Time = parsed.result;
    //     __AMS_API_TimeStr = parsed.result.toString();
    //
    //     $.jStorage.set("AMS_3_1_Runtime_API_Time", parsed.result);
    //
    // });


    var t = setTimeout(AMS_NavBar_MiscInfo_UpdateText, 5000);
}

function AMS_CommonUI_IP_Change(ip) {
    AMS_NavBar_IP_UpdateText(ip);

    // TODO: ...
}
function AMS_NavBar_IP_Selector_AppendEntry(ip) {
    $("#ams-navbar-ip-selector").append("<li><a href=\"#\" onclick=\"AMS_CommonUI_IP_Change(this.text)\">" + ip + "</a></li>");
}

function AMS_SideBar_UserInfo_Update(islogined, username){
    var sut = $("#ams-sidebar-userinfo-text");
    var sutt = sut.parent();
    if ( islogined == 1 ) {
        sut.text(username);
        sutt.attr("data-tooltip", "点此退出登录");
        sutt.attr("href", "#ams-window-user-logout");
    } else {
        sut.text("未登录");
        sutt.attr("data-tooltip", "点我来登录吧 (´・ω・`)");
        sutt.attr("href", "#ams-window-user-login");
    }
    sutt.tooltip();
}

function AMS_LocalStorage_GetLoggedInUserName() {
    return $.jStorage.get("AMS_3_1_Config_CurrentUser_Name", 0);
}

function AMS_LocalStorage_GetLoggedInUserToken() {
    return $.jStorage.get("AMS_3_1_Config_CurrentUser_Token", 0);
}

function AMS_LocalStorage_SetLoggedInUserName(name) {
    return $.jStorage.set("AMS_3_1_Config_CurrentUser_Name", name);
}

function AMS_LocalStorage_SetLoggedInUserToken(token) {
    __AMS_CurrentUser_Token = token;
    return $.jStorage.set("AMS_3_1_Config_CurrentUser_Token", token);
}

function AMS_LocalStorage_WipeLoggedInUserInfo(){
    $.jStorage.deleteKey("AMS_3_1_Config_CurrentUser_Token");
    $.jStorage.deleteKey("AMS_3_1_Config_CurrentUser_Name");
    __AMS_CurrentUser_Token = 0;
}



function AMS_StartupTask_ProcessLoggedInUser() {
    var usr = AMS_LocalStorage_GetLoggedInUserName();
    if (!usr) {
        AMS_SideBar_UserInfo_Update(0);
    } else {
        AMS_SideBar_UserInfo_Update(1, usr);
    }
}


function AMS_API_Change(){
    var newams_api_url = $("#ams-apisettings-window-form-url").val();

    AMS_LocalStorage_WipeLoggedInUserInfo();
    $.jStorage.set("AMS_3_1_Config_API_URL", newams_api_url);
    __AMS_API_URL = newams_api_url;
    location.reload();
}

function AMS_Action_Map_TR_Switch(){
    var btn = $("#ams-map-tr-btn");
    if (ams_map_tr === 0) {
        ams_map_tr = 1;
        btn.text("平均温度");
    } else {
        ams_map_tr = 0;
        btn.text("最高温度");
    }
}

function AMS_Action_Map_TC_Switch(){
    var btn = $("#ams-map-tc-btn");
    if (ams_map_tc === 0) {
        ams_map_tc = 1;
        btn.text("单设备");
    } else {
        ams_map_tc = 0;
        btn.text("控制器平均");
    }
}

function AMS_UI_Visibility(domid, b) {
    var d = $(domid);

    if (!b) {
        d.css('visibility', 'hidden');
        d.css('height', 0);
        d.css('width', 0);
    } else {
        d.css('visibility', 'visible');
        d.css('height', 'inherit');
        d.css('width', 'inherit');
    }
}