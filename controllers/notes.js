const Note = require('../models/Note');
const _ = require('underscore');
const jTask = require('../jobs/tasks');

module.exports = {

    /**
     * Obtiene todas las notas de un usuario
     *  Lo que tiene escribir las cosas y volver a revisar
     *  el cógido después de meses, index hace que saltes X número
     *  de posiciones respecto a la actual, es decir, si limitas (con el limit) a 5 el número
     *  de documentos que quieres ver y quieres ver los 5 siguientes tendrías que sumarle los restantes a index
     */
    index: (req, res) => {
        let index = req.query.index || 0;
        index = Number(index);

        let limit = req.query.limit || 10;
        limit = Number(limit);

        Note.find({ createdBy: req.userInfo._id })
            .skip(index)
            .limit(limit)
            .exec((err, notes) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                Note.count({ createdBy: req.userInfo._id }, (err, count) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            err
                        });
                    }

                    res.json({
                        ok: true,
                        notes,
                        count
                    });
                });
            });
    },

    // Muestra una nota específica
    show: (req, res) => {
        Note.findById(req.params.id, (err, note) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json(note);
        });
    },

    // Muestra las notas guardadas por un usuario
    saved: (req, res) => {

        let index = req.query.index || 0;
        index = Number(index);

        let limit = req.query.limit || 10;
        limit = Number(limit);

        Note.find({ savedBy: { $in: req.userInfo._id } })
            .skip(index)
            .limit(limit)
            .exec((err, notes) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                Note.count({ savedBy: { $in: req.params.id } }, (err, count) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            err
                        });
                    }

                    res.json({
                        ok: true,
                        notes,
                        count
                    })
                })
            })
    },

    // Crea una nota
    create: (req, res) => {
        let body = req.body;
        let note = {}

        if (body.remember) {
            note = new Note({
                title: body.title,
                content: body.content,
                createdAt: Date.now(),
                hidden: body.hidden,
                rememberDate: body.rememberDate,
                createdBy: req.userInfo._id
            });
        } else {
            note = new Note({
                title: body.title,
                content: body.content,
                hidden: body.hidden,
                createdAt: Date.now(),
                createdBy: req.userInfo._id
            });
        }

        note.save((err, note) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (note.rememberDate !== null) {
                jTask.create(note._id, note.rememberDate, req.userInfo.email, note.title, note.content);
            }

            res.json({
                ok: true,
                note,
            });
        });
    },

    // Actualizar una nota
    update: (req, res) => {
        let body = _.pick(req.body, ['hidden', 'title', 'content']);

        Note.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true }, (err, note) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!note) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Esa nota no existe'
                    }
                });
            }

            res.json({
                ok: true,
                note
            });
        });
    },

    // Borrar una nota
    delete: (req, res) => {
        Note.findByIdAndDelete(req.params.id, (err, note) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!note) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Esa nota no existe'
                    }
                });
            }

            res.json({
                ok: true,
                note
            });
        });
    },

    // Guarda la nota para un usuario
    like: (req, res) => {
        Note.findByIdAndUpdate(req.params.id, { new: true, runValidators: true, $push: { savedBy: req.userInfo._id } }, (err, note) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!note) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Esa nota no existe'
                    }
                });
            }

            res.json({
                ok: true,
                note
            });
        });
    },

    // Quita de guardados un usuario
    dislike: (req, res) => {
        Note.findByIdAndUpdate(req.params.id, { new: true, runValidators: true, $pull: { savedBy: req.userInfo._id } }, (err, note) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!note) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Esa nota no existe'
                    }
                });
            }

            res.json({
                ok: true,
                note
            });
        });
    }
}