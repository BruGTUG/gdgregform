var models = require('../models');
var auth = require('../auth');

module.exports = function(app) {

// get
app.get('/api/events/:id', function (req, res) {
    if (!auth.check(req,res)) return;
    if (!req.params.id) return res.send("Not found");
    models.gevents.find(req.params.id).success(function (e) {
        e.getParticipants().success(function(ps) {
                var newE = copySqObject(e);
                newE.participants = ps;
                res.json(newE);
        });
    }).error(onError(res));
});
// create 
app.post('/api/events', function (req, res){
  if (!auth.check(req,res)) return;
  models.gevents.create(req.body).success(function(p) { res.send(p);}).error(onError(res));
});
// update
app.put('/api/events/:id', function (req, res){
  if (!auth.check(req,res)) return;
  models.gevents.find(req.params.id).success(function (p) { 
	p.updateAttributes(req.body)
	  .success(function(p) { res.send(p);}).error(onError(res));
  }).error(onError(res)); 
});
// delete
app.delete('/api/events/:id', function (req, res){
  if (!auth.check(req,res)) return;
  models.gevents.find(req.params.id).success(function (p) { 
	p.destroy()
	  .success(function(p) { res.send({ok: true});}).error(onError(res));
  }).error(onError(res)); 
});
// list
app.get('/api/events', function (req, res) {
   if (!auth.check(req,res)) return;
   models.gevents.findAll().success(function(participants) {
     res.send(participants);
  })
});

