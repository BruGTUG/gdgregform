var models = require('../models'),
    auth = require('../auth'),
    Sequelize = require('sequelize'),
    secret = require('../secret');
db = require('../db');

module.exports = function (app) {

// get
    app.get('/api/events/:id', function (req, res) {
        if (!auth.check(req, res)) return;
        if (!req.params.id) return res.send("Not found");
        models.gevents.find(req.params.id).success(function (e) {
            if (e.fields) e.fields = JSON.parse(e.fields);
            var chainer = new Sequelize.Utils.QueryChainer();
            chainer
                .add(e.getParticipants())
                .add(models.participations.findAll({where: {event_id: req.params.id}}))
                .run()
                .success(function (results) {
                    var ps = results[0];
                    var regs = results[1];
                    for (var n = 0; n < regs.length; n++) {
                        regs[n] = db.copySqObject(regs[n]);
                        regs[n].cardUrl = secret.crypt(regs[n].id + "");
                    }

                    var newE = db.copySqObject(e);
                    newE.participants = ps;
                    newE.registrations = regs;
                    res.json(newE);
                });
        }).error(app.onError(res));
    });
// create 
    app.post('/api/events', function (req, res) {
        if (!auth.check(req, res)) return;
        if (req.body.fields) req.body.fields = JSON.stringify(req.body.fields);
        models.gevents.create(req.body).success(function (p) {
            res.send(p);
        }).error(app.onError(res));
    });
// update
    app.put('/api/events/:id', function (req, res) {
        if (!auth.check(req, res)) return;
        if (req.body.fields) req.body.fields = JSON.stringify(req.body.fields);
        models.gevents.find(req.params.id).success(function (p) {
            p.updateAttributes(req.body)
                .success(function (p) {
                    res.send(p);
                }).error(app.onError(res));
        }).error(app.onError(res));
    });
// delete
    app.delete('/api/events/:id', function (req, res) {
        if (!auth.check(req, res)) return;
        models.gevents.find(req.params.id).success(function (event) {
            event.destroy()
                .success(function (p) {
                    models.participations.findAll({where: {event_id: req.params.id}}).success(function (regs) {
                        regs.forEach(function (reg) {
                            reg.destroy();
                        });
                        res.send({ok: true});
                    });

                }).error(app.onError(res));
        }).error(app.onError(res));
    });
// list
    app.get('/api/events', function (req, res) {
        if (!auth.check(req, res)) return;
        models.gevents.findAll().success(function (events) {
            res.send(events);
        }).error(app.onError(res));
    });

    var emailAuth = require('../../config.json').mail;
    var sendEmail = function (id) {

    }
//approve
    var card = require('../card.js');

    app.post('/api/events/:id/approve', function (req, res) {
        if (!auth.check(req, res)) return false;
        if (!req.body.participants) return res.send(400, "Bad Request - no participants to approve");
        var sender;
        if (req.body.sendEmail)
            sender = card.createMailer(req.user);
        models.participations.findAll({ where: {event_id: req.params.id}})
            .success(function (regs) {
                var success = true;
                waitFor = 0;

                for (var i = 0; i < regs.length; i++) {
                    if (!regs[i].approved && req.body.participants.indexOf(regs[i].googler_id + "") > -1) {
                        var approve = function approveRegistration(reg) {
                            waitFor++;
                            var sendCb = function (result) {
                                if (!result) {
                                    reg.updateAttributes({accepted: false});
                                    success = false;
                                }

                                if (--waitFor == 0) {
                                    sender.close();
                                    res.send({ok: success});
                                }
                            };
                            reg.updateAttributes({accepted: true}).success(function () {

                                if (sender)
                                    sender.sendEmail(reg.id, req.protocol + "://" + req.get('host'), sendCb);
                                else sendCb(true);

                            });
                        };
                        approve(regs[i]);
                    }
                }
                //res.send({ok:true});
            });
        return true;
    });
    app.post('/api/events/:id/resend', function (req, res) {
        if (!auth.check(req, res)) return false;
        if (!req.body.id) return res.send(400, "Bad Request - no participation to send");
        var sender = card.createMailer(req.user);
        models.participations.find({ where: {event_id: req.params.id, googler_id:req.body.id}})
            .success(function (reg) {
                sender.sendEmail(reg.id, req.protocol + "://" + req.get('host'), function(result){
                    res.send({ok:result});
                });
            });
    });


}

