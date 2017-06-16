//查找表格的<th>元素，让它们可单击
function makeSortable(table) {
    var headers=table.getElementsByTagName("th");
    for(var i=0;i<headers.length;i++){
        (function(n){
            var flag=false;
            headers[n].onclick=function(){
                // sortrows(table,n);
                var tbody=table.tBodies[0];//第一个<tbody>
                var rows=tbody.getElementsByTagName("tr");//tbody中的所有行
                rows=Array.prototype.slice.call(rows,0);//真实数组中的快照

                //基于第n个<td>元素的值对行排序
                rows.sort(function(row1,row2){
                    var cell1=row1.getElementsByTagName("td")[n];//获得第n个单元格
                    var cell2=row2.getElementsByTagName("td")[n];
                    var val1=cell1.textContent||cell1.innerText;//获得文本内容
                    var val2=cell2.textContent||cell2.innerText;

                    if(val1<val2){
                        return -1;
                    }else if(val1>val2){
                        return 1;
                    }else{
                        return 0;
                    }
                });
                if(flag){
                    rows.reverse();
                }
                //在tbody中按它们的顺序把行添加到最后
                //这将自动把它们从当前位置移走，故没必要预先删除它们
                //如果<tbody>还包含了除了<tr>的任何其他元素，这些节点将会悬浮到顶部位置
                for(var i=0;i<rows.length;i++){
                    tbody.appendChild(rows[i]);
                }

                flag=!flag;
            }
        }(i));
    }
}

window.onload=function(){
    var table=document.getElementsByTagName("table")[0];
    makeSortable(table);
}