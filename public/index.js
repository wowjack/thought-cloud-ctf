var auth_user = false;
var user_data = false;

document.addEventListener('DOMContentLoaded', function() {
    let app = firebase.app();
    firebase.auth().signInAnonymously().catch(() => console.log("error signing in"));
    
    firebase.auth().onAuthStateChanged(user => {
        if(user) {
            auth_user = user;
            fetch_user_data();
        } else {
            auth_user = false;
            render_error();
        }
    });
});

function fetch_user_data() {
    firebase.database().ref(`/users/${auth_user.uid}`).on("value", snapshot => {
        if(snapshot.exists() === false) {
            user_data = {};
            return;
        }
        try {
            user_data = JSON.parse(snapshot.val());
            render_thoughts();
        } catch(error) {
            render_error();
        }
    });
}

function render_thoughts() {
    thought_container = $("#thought-container");
    thought_container.empty();
    Object.entries(user_data).map(([title, thought], ind) => {
        thought_container.append(/*html*/`
            <div style="border-style: solid; border-radius: 10px; border-width: 1px; min-width: 300px; padding-inline: 10px; margin: 10px">
                <h2 id="thought-${ind}-title"></h3>
                <p style="max-width: 400px; word-wrap: break-word" id="thought-${ind}"></p>
            </div>
        `);
        $(`#thought-${ind}-title`).text(title);
        $(`#thought-${ind}`).text(thought);
    });
}

function render_error() {
    $("#page-body").html(/*html*/`
        <h1>A strange error occurred.</h1>
        <button onclick="clear_thoughts();">Clear your thoughts</button>
    `);
}

function clear_thoughts() {
    firebase.database().ref(`/users/${auth_user.uid}`).remove().then(render_thoughts);
}

// Add new thought to the saved thoughts and save it to the database
$("#thought-form").on("submit", _ => {
    const title = $("#thought-title").val();
    const thought = $("#thought-body").val();
    if(user_data === false) user_data = {};
    user_data[title] = thought;
    firebase.database().ref(`/users/${auth_user.uid}`).set(JSON.stringify(user_data));
});

$("#get-flag-button").on("click", async () => {
    res = await firebase.functions().httpsCallable("get_flag")();
    alert(res.data);
    alert("But since you were so nice about it I'll show you the secret firebase function code.");
    window.location.href = "/functions.html"
});

