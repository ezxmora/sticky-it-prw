const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

let validRoles = {
    values: ['admin', 'user'],
    message: '{VALUE} no es un rol válido'
};

const UserSchema = new Schema({
    email: {
        type: String,
        required: [true, 'El correo es necesario'],
        trim: true,
        unique: true
    },
    username: {
        type: String,
        required: [true, 'El nombre de usuario es obligatorio'],
        trim: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
    },
    banned: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: 'user',
        enum: validRoles
    },
    isEnabled2FA: {
        type: Boolean,
        default: false
    },
    secret2FA: {
        type: String
    }
});

UserSchema.methods.toJSON = function () {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    delete userObject.secret2FA;

    return userObject;
}

// Crea una contraseña encriptada
UserSchema.methods.generateHash = function (password) {
    return bcryptjs.hash(password, 20)
}

// Comprueba si una contraseña es válida
UserSchema.methods.validPassword = function (password) {
    return bcryptjs.compareSync(password, this.password)
}

const User = mongoose.model('Users', UserSchema);
UserSchema.set('autoIndex', false);
UserSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });


module.exports = User;