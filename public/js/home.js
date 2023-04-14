(async () => {
    let authenticated = false;
    const username = localStorage.getItem('username');

    if (username) {
        const usernameField = $('#login-name');
        usernameField.val(username);
        const user = await getUser(username);
        authenticated = user?.authenticated;
    }

    if (authenticated) {
        $('#logout-username').text(username);
        $('#logout').removeClass('hidden');
        $('#navbar-link-chat').removeClass('hidden');
        $('#navbar-logout').removeClass('hidden');
    } else {
        $('#login').removeClass('hidden');
    }
})();

// Get a user from the server
async function getUser(username) {
    const response = await fetch(`/api/user/${username}`);

    if (response.status === 200) {
        return response.json();
    }

    return null; // No user
}

// Check the information in the login form
const checkLoginInfo = async (create = false) => {
    const username = $('#login-name').val().trim();
    const password = $('#login-password').val().trim();

    if (username === "" && password === "") {
        return alert('Please Enter a Username and Password');
    } else if (username === "") {
        return alert('Please Enter a Username');
    } else if (password === "") {
        return alert('Please Enter a Password');
    }

    if (create) {
        endpoint = '/api/auth/create';
    } else {
        endpoint = '/api/auth/login';
    }

    // Login or Create user
    const response = await fetch(endpoint, {
        method: 'post',
        body: JSON.stringify({ username: username, password: password }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        }
    });
    const body = await response.json();

    if (response?.status === 200) {
        localStorage.setItem('username', username);
        window.location.href = "chat.html";
    } else {
        $('#login-error').removeClass('hidden').text(`Error: ${body.msg}`);
    }
};

// Bind checkLogin to login button press and Enter press in Login fields
$('#login-login').click(() => checkLoginInfo(false));
$('#login-name').keypress((e) => {
    if (e.which == 13) {
        checkLoginInfo(false);
        return false;
    }
});
$('#login-password').keypress((e) => {
    if (e.which == 13) {
        checkLoginInfo(false);
        return false;
    }
});

// Bind checkLogin to create button press with create flag
$('#login-create').click(() => checkLoginInfo(true));

// Go to Chat page on press of continue button
$('#logout-continue').click(() => {
    window.location.href = "chat.html";
});

// Bind logout request to Logout button
$('#logout-logout').click(() => {
    fetch(`/api/auth/logout`, {
        method: 'delete',
    }).then(() => (window.location.href = '/'));
});

$('#navbar-logout').click(() => {
    fetch(`/api/auth/logout`, {
        method: 'delete',
    }).then(() => (window.location.href = '/'));
});

const updateBackground = () => {
    fetch(`https://picsum.photos/v2/list?page=${Math.floor(Math.random() * 1000)}&limit=1`)
        .then((resp) => resp.json())
        .then((data) => {
            $('#background').css("background", `url(https://picsum.photos/id/${data[0].id}/480/480?grayscale)`);
        });
}

updateBackground();