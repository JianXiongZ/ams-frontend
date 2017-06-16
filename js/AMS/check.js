 $(document).ready(function(){
    $("[type=checkbox]").click(function(){
    
        inputs=$("#tb1").find("input");
            str=0; 
            for(i=0;i<inputs.length;i++){   
                if(inputs[i].type=="checkbox"){
                    if(inputs[i].checked&&inputs[i].name=="chk"){
                        checkedRow=inputs[i];
                        tr = checkedRow.parentNode.parentNode;
                        tds = tr.cells;
                        //循环列              
                        strr = parseInt(tds[3].innerHTML) ;
                        str += strr 
                        }                       
                    }
                }
         //alert(str);
  $("order").value=str;
   
});
});

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