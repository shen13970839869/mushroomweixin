var database=require ("./db.js");
var updatashoppingcartnumberup=function(req, res){
  var params = [req.body.gid,req.body.uname,req.body.color];
  console.log('updatashoppingcartnumberup'+params)
  var sql = 'update  shoppingcart set number=number+1   where gid = ? and uname = ? and color=?';
  database.connection.query(sql , params,function (err, data) {
        if (err) {
          console.log(err);
        } else {
          var result = {
            "status": "200",
            "message": "success",
          }
          result.data = data;
          res.end(JSON.stringify(result));
        }
      });
      //database.connection.end();//断开连接
}
module.exports = {updatashoppingcartnumberup}