/**
 * Created by root on 17-3-5.
 */

class APIReq {

    static get LoggingLevels(){
        return {
            None: 0,
            Console: 0x1, Toast: 0x2,
            Debug: 0x10, Error: 0x20
        };
    };

    constructor(init_list) {
        if (init_list.APIURL)
            this.APIURL = init_list.APIURL;
        else
            this.APIURL = RuntimeData.API.URL();

        if (init_list.Token)
            this.Token = init_list.Token;
        else
            this.Token = RuntimeData.User.Token();

        if (init_list.JSON)
            this.RefineJSONwithSerialized(init_list.JSON);
        else if (init_list.RawData)
            this.RefineJSONwithRaw(init_list.RawData);

        if (init_list.ResponseNoParse)
            this.ResponseNoParse = init_list.ResponseNoParse;

        if (init_list.DoneCallback)
            this.DoneCallback = init_list.DoneCallback;

        if (init_list.ErrorCallback)
            this.ErrorCallback = init_list.ErrorCallback;

        if (init_list.Logging)
            this.Logging = init_list.Logging;
        else
            this.Logging = APIReq.LoggingLevels.Console | APIReq.LoggingLevels.Toast | APIReq.LoggingLevels.Error;

        if (init_list.Blocking)
            this.Blocking = init_list.Blocking;

        if (init_list.NextReq)
            this.NextReq = init_list.NextReq;

        if (init_list.AtOnce)
            this.Dispatch();

    }

    Dispatch(){

        let reqctx = this;

        console.log(this);

        $.ajax({
            async: !reqctx.Blocking,
            type: reqctx.RequestData ? "POST" : "GET",
            url: reqctx.APIURL,
            data: reqctx.RequestData ? reqctx.RequestData : undefined,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            error: function(jqXHR, textStatus, errorThrown){
                if (reqctx.ErrorCallback)
                    reqctx.ErrorCallback(jqXHR.status);

                let errmsg = "APIReq::Dispatch() error: Request of " + reqctx.APIURL + " returned HTTP error code " +
                    jqXHR.status.toString();

                if (reqctx.Logging & APIReq.LoggingLevels.Error) {
                    if (reqctx.Logging & APIReq.LoggingLevels.Console)
                        console.log(errmsg);
                    if (reqctx.Logging & APIReq.LoggingLevels.Toast)
                        Materialize.toast(errmsg, 3000);
                }
            }

        }).done(function(data, textStatus, jqXHR){
            if (reqctx.Logging & APIReq.LoggingLevels.Debug) {
                let errmsg = "APIReq::Dispatch() debug: Connection finished";

                if (reqctx.Logging & APIReq.LoggingLevels.Console)
                    console.log(errmsg);
                if (reqctx.Logging & APIReq.LoggingLevels.Toast)
                    Materialize.toast(errmsg, 3000)
            }

            console.log(this);

            if (reqctx.DoneCallback) {
                if (reqctx.ResponseNoParse) {
                    reqctx.DoneCallback(jqXHR.responseText);
                } else {
                    let parsed = JSON.parse(jqXHR.responseText);
                    let rc = parsed.rc;

                    if (Number.isInteger(rc) && rc !== 0)  {
                        if (reqctx.ErrorCallback)
                            reqctx.ErrorCallback(parsed);

                        let errmsg = "APIReq::Dispatch() error: API request failed: ";

                        switch (rc) {
                            case -1:
                                errmsg += "Invalid argument";
                                break;
                            case 65333:
                                errmsg += "Invalid login token";
                                break;
                            case 65334:
                                errmsg += "Bad request format";
                                break;
                            case 65335:
                                errmsg += "Malformed request";
                                break;
                            default:
                                errmsg += "Unknown error";
                                break;
                        }

                        if (reqctx.Logging & APIReq.LoggingLevels.Error) {
                            if (reqctx.Logging & APIReq.LoggingLevels.Console)
                                console.log(errmsg);
                            if (reqctx.Logging & APIReq.LoggingLevels.Toast)
                                Materialize.toast(errmsg, 3000)
                        }

                    } else {
                        if (reqctx.Logging & APIReq.LoggingLevels.Debug) {
                            let errmsg = "APIReq::Dispatch() debug: Calling DoneCallback";

                            if (reqctx.Logging & APIReq.LoggingLevels.Console)
                                console.log(errmsg);
                            if (reqctx.Logging & APIReq.LoggingLevels.Toast)
                                Materialize.toast(errmsg, 3000)
                        }

                        reqctx.DoneCallback(parsed);
                    }
                }
            }

            if (reqctx.NextReq)
                reqctx.NextReq.Dispatch();
        });
    }

    RefineJSONwithSerialized(serialized_json){
        if (this.Token) {
            let buf = JSON.parse(serialized_json);
            buf["auth"] = this.Token;
            this.RequestData = JSON.stringify(buf);
        } else {
            this.RequestData = serialized_json;
        }
    }

    RefineJSONwithRaw(raw_data){
        let buf = raw_data;
        if (this.Token)
            buf["auth"] = this.Token;
        this.RequestData = JSON.stringify(buf);
    }




}

function apiReq(serialized_req, donefunc, errfunc) {

    var j_buf;
    var j_s_t = serialized_req;

    if (__AMS_CurrentUser_Token !== 0) {
        j_buf = JSON.parse(serialized_req);
        j_buf["auth"] = __AMS_CurrentUser_Token;
        j_s_t = JSON.stringify(j_buf);
    }

    $.ajax({
        async: true,
        type: "POST",
        url: __AMS_API_URL,
        data: j_s_t,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        error: function(data, textStatus, jqXHR){
            if (errfunc)
                errfunc();
            else
                Materialize.toast("API请求失败：连接失败或服务器内部错误", 3000);
        }
    }).done(function(data, textStatus, jqXHR){
        var parsed = JSON.parse(jqXHR.responseText);
        var rc = parsed.rc;
        console.log(rc);
        if (rc === 0) {
            donefunc(parsed);
        } else {
            if (errfunc)
                errfunc(parsed);
            else {
                switch (rc) {
                    case -1:
                        Materialize.toast("API请求失败：操作参数错误", 3000);
                        break;
                    case 65333:
                        Materialize.toast("API请求失败：身份验证失败，请重新登录", 3000);
                        AMS_LocalStorage_WipeLoggedInUserInfo();
                        AMS_SideBar_UserInfo_Update(0);
                        break;
                    case 65334:
                        Materialize.toast("API请求失败：主要参数错误", 3000);
                        break;
                    case 65335:
                        Materialize.toast("API请求失败：不完整或出错的请求", 3000);
                        break;
                    default:
                        Materialize.toast("API请求失败：核心内部错误", 3000);
                        break;
                }
            }
        }
    });
}

function apiReq_low(serialized_req, token, api_url, donefunc, errfunc) {

    var j_buf;
    var j_s_t = serialized_req;

    if (token !== 0) {
        j_buf = JSON.parse(serialized_req);
        j_buf["auth"] = token;
        j_s_t = JSON.stringify(j_buf);
    }

    $.ajax({
        async: true,
        type: serialized_req ? "POST" : "GET",
        url: api_url,
        data: serialized_req ? j_s_t : null,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        error: function(data, textStatus, jqXHR){
            if (errfunc)
                errfunc();
            else
                Materialize.toast("API请求失败：连接失败或服务器内部错误", 3000);
        }
    }).done(function(data, textStatus, jqXHR){
        var parsed = JSON.parse(jqXHR.responseText);
        var rc = parsed.rc;
        console.log(rc);
        if (Number.isInteger(rc) && rc !== 0)  {
            if (errfunc)
                errfunc(parsed);
            else {
                switch (rc) {
                    case -1:
                        Materialize.toast("API请求失败：操作参数错误", 3000);
                        break;
                    case 65333:
                        Materialize.toast("API请求失败：身份验证失败，请重新登录", 3000);
                        break;
                    case 65334:
                        Materialize.toast("API请求失败：主要参数错误", 3000);
                        break;
                    case 65335:
                        Materialize.toast("API请求失败：不完整或出错的请求", 3000);
                        break;
                    default:
                        Materialize.toast("API请求失败：核心内部错误", 3000);
                        break;
                }
            }
        } else {
            donefunc(parsed);
        }
    });
}

function test_ip_list(){
    var xxx= {"rc": 0, "data": {"controllers": [{"mtime": 1493136630, "ip": "192.168.11.5", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.6", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.9", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.10", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.11", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.13", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.15", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.16", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.20", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.22", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.24", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.32", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.35", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.37", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.40", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.43", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.46", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.47", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.48", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.51", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.52", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.57", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.60", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.61", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.63", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.64", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.65", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.66", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.68", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.69", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.70", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.71", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.74", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.75", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.76", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.77", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.79", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.82", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.84", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.89", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.90", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.91", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.96", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.100", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.102", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.103", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.104", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.110", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.111", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.112", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.113", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.114", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.115", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.116", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.123", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.125", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.126", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.128", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.129", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.130", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.131", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.132", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.133", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.135", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.136", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.137", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.138", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.139", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.140", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.141", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.142", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.143", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.144", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.145", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.146", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.147", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.148", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.149", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.150", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.151", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.152", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.153", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.154", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.155", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.156", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.157", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.158", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.159", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.160", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.161", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.162", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.163", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.164", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.165", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.166", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.167", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.168", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.169", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.170", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.171", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.174", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.175", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.176", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.177", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.178", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.179", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.180", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.181", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.182", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.183", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.184", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.185", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.187", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.188", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.189", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.190", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.191", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.192", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.193", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.194", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.195", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.196", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.197", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.198", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.199", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.200", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.202", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.203", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.204", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.205", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.206", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.207", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.208", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.209", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.210", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.211", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.212", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.213", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.214", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.215", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.11.216", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.2", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.3", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.4", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.5", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.6", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.7", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.8", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.9", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.10", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.11", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.12", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.13", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.14", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.15", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.16", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.17", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.18", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.20", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.21", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.23", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.30", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.31", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.60", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.100", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.101", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.120", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.122", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.123", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.124", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.125", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.126", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.127", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.128", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.129", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.130", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.131", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.132", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.133", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.134", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.135", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.136", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.137", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.138", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.139", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.140", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.141", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.142", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.143", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.144", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.145", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.146", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.147", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.148", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.149", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.150", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.151", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.152", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.153", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.154", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.155", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.156", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.157", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.158", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.159", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.161", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.162", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.163", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.164", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.165", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.166", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.167", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.168", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.169", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.170", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.171", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.172", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.173", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.174", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.175", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.176", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.177", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.178", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.179", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.180", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.181", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.182", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.183", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.184", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.185", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.186", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.187", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.188", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.189", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.190", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.191", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.192", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.193", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.194", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.195", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.196", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.197", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.198", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.199", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.200", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.201", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.202", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.203", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.204", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.205", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.206", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.207", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.208", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.209", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.212", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.213", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.214", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.215", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.216", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.217", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.218", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.220", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.221", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.222", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.223", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.224", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.12.225", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.32", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.47", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.49", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.51", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.60", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.63", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.66", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.67", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.71", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.72", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.73", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.81", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.95", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.111", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.120", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.121", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.122", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.123", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.124", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.125", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.126", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.127", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.128", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.129", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.130", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.131", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.132", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.133", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.134", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.135", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.136", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.137", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.138", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.139", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.140", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.141", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.142", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.144", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.145", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.146", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.147", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.148", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.149", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.150", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.151", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.152", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.153", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.154", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.155", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.156", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.157", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.158", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.159", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.160", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.161", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.162", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.163", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.164", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.165", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.166", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.167", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.168", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.169", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.170", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.171", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.172", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.173", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.174", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.175", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.176", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.177", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.178", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.179", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.180", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.181", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.182", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.183", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.184", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.185", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.186", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.187", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.188", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.189", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.190", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.192", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.193", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.194", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.195", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.196", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.197", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.198", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.199", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.200", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.201", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.202", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.203", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.204", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.205", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.206", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.208", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.209", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.210", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.211", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.212", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.213", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.214", "port": 4028}, {"mtime": 1493136630, "ip": "192.168.13.216", "port": 4028}]}};

    return xxx;

}

function test_pool_list(){
    var xxx={"rc": 0, "data": {"Status": {"Devices": [{"Status": "Alive", "ASC": 0, "MHS1m": 31017701.41, "Name": "AV7", "Enabled": "Y", "ID": 0, "Temperature": 31.27, "MMCount": 5, "MHS15m": 30789900.989999998, "MHSav": 30588340.739999998, "MHS5s": 32431613.079999998, "MHS5m": 30916319.68, "LastValidWork": 1484113792}, {"Status": "Alive", "ASC": 1, "MHS1m": 31553193.84, "Name": "AV7", "Enabled": "Y", "ID": 1, "Temperature": 32.43, "MMCount": 5, "MHS15m": 31380916.050000001, "MHSav": 31267202.52, "MHS5s": 30154281.809999999, "MHS5m": 31347813.489999998, "LastValidWork": 1484113792}], "Summary": {"Elapsed": 512493, "MHSav": 61855080.859999999, "Accepted": 28557, "Rejected": 226, "NetworkBlocks": 914, "BestShare": 4638318524}, "Pools": [{"PoolID": 0, "GetWorks": 16053, "URL": "stratum+tcp://n53KA9Qq.vip.stratum.1hash.com:3333", "Status": "!!conversion error!!", "StratumActive": 1, "User": "g721.04230", "Rejected": 226, "Stale": 2, "Accepted": 28557, "LastShareTime": 1484113782, "LastShareDifficulty": 262144}], "Modules": [{"Fan": 8100, "LW": 19039904, "DeviceID": 0, "ModuleID": 1, "ECHU": [512, 0, 0, 0], "LED": 0, "ECMM": 0, "Elapsed": 512464, "Ver": "7211612-9e791f0", "DNA": "01308ab0e97330db", "PG": 15, "DH": 3.1739999999999999, "GHSmm": 6332.1800000000003, "WU": 83446.630000000005, "FanR": 99, "Temp": 29, "TMax": 90}, {"Fan": 5820, "LW": 3395772, "DeviceID": 0, "ModuleID": 2, "ECHU": [128, 128, 128, 128], "LED": 0, "ECMM": 0, "Elapsed": 91435, "Ver": "7211612-9e791f0", "DNA": "013688d70df12bb5", "PG": 15, "DH": 1.5249999999999999, "GHSmm": 6942.4200000000001, "WU": 93986.419999999998, "FanR": 100, "Temp": 31, "TMax": 98}, {"Fan": 6540, "LW": 19039819, "DeviceID": 0, "ModuleID": 3, "ECHU": [0, 0, 0, 0], "LED": 0, "ECMM": 0, "Elapsed": 512464, "Ver": "7211612-9e791f0", "DNA": "01389d2dff9362c2", "PG": 15, "DH": 3.98, "GHSmm": 6154.5200000000004, "WU": 80113.270000000004, "FanR": 58, "Temp": 30, "TMax": 87}, {"Fan": 4050, "LW": 19041758, "DeviceID": 0, "ModuleID": 4, "ECHU": [0, 0, 0, 0], "LED": 0, "ECMM": 0, "Elapsed": 512498, "Ver": "7211612-9e791f0", "DNA": "0139a0c22ebb86c8", "PG": 15, "DH": 2.1629999999999998, "GHSmm": 6767.2799999999997, "WU": 89918.440000000002, "FanR": 99, "Temp": 30, "TMax": 90}, {"Fan": 8100, "LW": 19039940, "DeviceID": 0, "ModuleID": 5, "ECHU": [0, 0, 0, 0], "LED": 0, "ECMM": 0, "Elapsed": 512463, "Ver": "7211612-9e791f0", "DNA": "013e5422879fc4fb", "PG": 15, "DH": 2.468, "GHSmm": 6631.6700000000001, "WU": 88123.289999999994, "FanR": 94, "Temp": 28, "TMax": 87}, {"Fan": 4050, "LW": 19017152, "DeviceID": 1, "ModuleID": 1, "ECHU": [0, 128, 0, 0], "LED": 0, "ECMM": 0, "Elapsed": 511833, "Ver": "7211612-9e791f0", "DNA": "0134ab669b8a88ff", "PG": 15, "DH": 1.7350000000000001, "GHSmm": 6883.8100000000004, "WU": 91835.669999999998, "FanR": 100, "Temp": 30, "TMax": 92}, {"Fan": 5910, "LW": 6499257, "DeviceID": 1, "ModuleID": 2, "ECHU": [128, 128, 128, 128], "LED": 0, "ECMM": 0, "Elapsed": 174944, "Ver": "7211612-9e791f0", "DNA": "013885abde559856", "PG": 15, "DH": 1.6699999999999999, "GHSmm": 6895.9799999999996, "WU": 92500.369999999995, "FanR": 100, "Temp": 30, "TMax": 96}, {"Fan": 7560, "LW": 19042244, "DeviceID": 1, "ModuleID": 3, "ECHU": [0, 0, 0, 0], "LED": 0, "ECMM": 0, "Elapsed": 512496, "Ver": "7211612-9e791f0", "DNA": "01393b3fdcda4c77", "PG": 15, "DH": 3.331, "GHSmm": 6372.6099999999997, "WU": 82070.800000000003, "FanR": 72, "Temp": 30, "TMax": 87}, {"Fan": 7620, "LW": 19042333, "DeviceID": 1, "ModuleID": 4, "ECHU": [0, 0, 0, 0], "LED": 0, "ECMM": 0, "Elapsed": 512495, "Ver": "7211612-9e791f0", "DNA": "0139b341681f1377", "PG": 15, "DH": 2.5790000000000002, "GHSmm": 6475.1400000000003, "WU": 86869.570000000007, "FanR": 74, "Temp": 29, "TMax": 87}, {"Fan": 4050, "LW": 19042055, "DeviceID": 1, "ModuleID": 5, "ECHU": [640, 0, 0, 128], "LED": 0, "ECMM": 0, "Elapsed": 512495, "Ver": "7211612-9e791f0", "DNA": "013c1deffa0b0268", "PG": 15, "DH": 2.403, "GHSmm": 6633.29, "WU": 87789.369999999995, "FanR": 81, "Temp": 30, "TMax": 86}]}}};

    return xxx;
}