 function click_checkbox(){
      var  str = 0;
      var inputs=$("#tb1").find("input");
            for(i=0;i<inputs.length;i++){   
                if(inputs[i].type=="checkbox"){
                    if(inputs[i].checked&&inputs[i].name=="chk"){
                      var  checkedRow=inputs[i];
                       var tr = checkedRow.parentNode.parentNode;
                       var tds = tr.cells;
                        //循环列              
                      var  strr = parseInt(tds[4].innerHTML) ;
                        str += strr  ;
                        }                        
                    }
                }
         //alert(str);
  $("#miner_numbers").text(str);
   
};

    function changeState(isChecked)
     {

       var chk_list=$("input");
       for(var i=0;i<chk_list.length;i++)
        {
         if(chk_list[i].type=="checkbox")
          {
           chk_list[i].checked=isChecked;
          }
        }
    }