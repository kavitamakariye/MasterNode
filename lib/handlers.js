/*
* Request handlers
*/

//Dependencies
var _data = require('./data');
var helpers = require('./helpers');
var config = require('./config');
//Define the handlers
var handlers = {};

//Users
handlers.users = function(data,callback){
    var acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method > -1)){
        handlers._users[data.method](data,callback);
    }else{
        callback(405)
    }
}
//Container for the users submethods
handlers._users = {}

//Required data : firstName, lastName, phone, password, tosAggrement
//Optional data : none

//Users - post
handlers._users.post = function(data,callback){
 //Check that all required fieds are filled out
 var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
 var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
 var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 0 ? data.payload.phone.trim() : false;
 var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
 var tosAggrement = typeof(data.payload.tosAggrement) == 'boolean' && data.payload.tosAggrement == true ? true : false;

 if (firstName && lastName && phone && password && tosAggrement) {
    //Make sure the user doesnt already exits
    _data.read('users',phone,function(err,data){
        if(err){
            //Hash the password
            var hashedPassword = helpers.hash(password);
            if(hashedPassword){
                  //Create the user object
            var userObject = {
                firstName : firstName,
                lastName : lastName,
                phone : phone,
                hashedPassword : hashPassword,
                tosAggrement : true
            }

            //Store the user
            _data.create('users', phone, userObject, function(err){
                if(!err){
                    callback(500)
                }else{
                    console.log(err);
                    callback(500,{'Error ':"Could not create the new user"});
                    
                }
            })
            }else{
                callback(500,{'Error':'Could not hash the user'})
            }
          
        }else{
            callback('400', {'Error':'A user with that phone number already exist.'})
        }
    })
     
 }else{
     callback(400,{'Error': 'Missing required fields'})
 }
}

//Users - get
//Required field - phone
//Optional field - none
//Only let authenticated user access their object. Don't let anyone access object of elses.
handlers._users.get = function(data,callback){
    //Check that the phone number is valid
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if(phone){
        //Look up the user
        _data.read('users',phone,function(err,data){
            if(!err && data){
                //Remove the hashed password from the user object before returning it to the requester
                delete data.hashPassword;
                callback(200,data);
            }else{
                callback(404);
            }
        })
    }else{
        callback(400, {'Error ': "Missing required field."})
    }

}
//Users - put
//Required field - phone
//Optional field - firstName, lastName, password (atleast one must be specified)
//Only let an authenticate user update their own objec.t Don't let them update anyone elses.
handlers._users.put = function(data,callback){

    //Check for the required field.
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    //Check for the optional field.
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    //Error if the phone is invalid
    if(phone){
        //Error if nothing is sent to update
        if(firstName || lastName || password){
            //Looking  the user
            _data.read('users',phone,function(err,userData){
                if(!err && userData){
                    //Update the fields necessary
                    if(firstName){
                        userData.firstName = firstName
                    }
                    if(lastName){
                        userData.lastName = lastName
                    }
                    if(password){
                        userData.hashPassword = helpers.hash(password);
                    }

                    //Store the updates
                    _data.update('users',phone,userData,function(err){
                        if(!err){
                            callback(200)
                        }else{
                            console.log(err)
                            callback(500,{'Error': "Could not update the user"});
                            
                        }
                    })
                }else{
                    callback(400, {'Error': "The specified user does not exist."})
                }
            })
        }else{
            callback(400,{'Error': "Missing field to update."})
        }
    }else{
        callback(400,{'Error ': "Missing required field."})
    }
}
//Users - delete
//Required field - phone
//Only let the authenticated user delete his object. Don't let delete anyone elses.
//Cleanup (delete) any other files associated with this user

handlers._users.delete = function(data,callback){
//Check that the phone number is valid
var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
if(phone){
    //Look up the user
    _data.read('users',phone,function(err,data){
        if(!err && data){
        _data.delete('users',phone,function(){
            if(!err){
                callback(200);
            }else{
                callback(500,{'Error': "Could not delete the specified user"})
            }
        })
        }else{
            callback(400,{'Error' : 'Could not find the specified user'});
        }
    })
}else{
    callback(400, {'Error ': "Missing required field."})
}
}
// Ping handler
handlers.ping = function (data, callback) {
    callback('200')
}

//Not found handler
handlers.notFound = function (data, callback) {
    callback('404')
};

//Export the module

module.exports = handlers;