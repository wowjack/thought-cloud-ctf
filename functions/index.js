const {log} = require("firebase-functions/logger")
const {onCall} = require("firebase-functions/v2/https");
const {getDatabase} = require("firebase-admin/database");
const {initializeApp} = require("firebase-admin/app");
initializeApp();


exports.get_flag = onCall(async (request) => {
    reset()

    //make sure you're authenticated before giving you the flag
    const uid = request.auth?.uid ?? false;
    if(uid == false) return "You aren't even authenticated. Why did you expect this to work?";

    //make sure you're not a foul mouthed heathen before giving you the flag
    const json_data = (await getDatabase().ref(`/users/${uid}`).get()).val() ?? "{}";
    user_data = {};
    try {
        old_data = JSON.parse(json_data);
        //remove swears and save the old data for logging purposes :)
        if(clean_and_copy(old_data, user_data)){
            log("SWEARING DETECTED: ", old_data);
            return "No flag for you, you foul mouthed heathen.";
        }
    } catch(error) {
        return "Your user data is not valid.";
    }

    //make sure you are admin before giving you the flag
    const admin_data = (await getDatabase().ref(`/admins/${uid}`).get()).val() ?? {};
    if(admin_data.is_admin !== true) return "Access denied. You aren't an admin.";

    //after passing all three checks, you get the flag
    return process.env.FLAG;
});

//super funky stuff because for some reason database calls hang if you try to set object prototype to undefined.
function reset() {
    x = {"hello": "there"};
    p = "__proto__";
    a = "is_admin";
    delete x[p][a];
}

//Copies object "from" to "to" and removes any swears
//Returns whether a swear was detected or not
const swears = ["crap", "stupid", "idiot", "peenids", "ass"]
function clean_and_copy(from, to) {
    to = to ?? {};
    for([key, val] of Object.entries(from)) {
        if(!swears.includes(key) && !swears.includes(val)) {
            if(typeof val == 'object') {
                clean_and_copy(val, to[key]);
            } else {
                to[key] = val;
            }
        } else {
            return true;
        }
    }
    return false;
}