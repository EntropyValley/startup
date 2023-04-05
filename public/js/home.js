const checkLoginInfo = () => {
    const name = $('#login-name').val().trim();
    const password = $('#login-password').val().trim();

    if (name === "" && password === "") {
        return alert('Please Enter a Username and Password');
    } else if (name === "") {
        return alert('Please Enter a Username');
    } else if (password === "") {
        return alert('Please Enter a Password');
    }

    localStorage.setItem('username', name);
    window.location.href='chat.html';
};

// Bind checkLogin to button press and Enter press in Login fields
$('#login-submit').click(checkLoginInfo);
$('#login-name').keypress((e) => {
    if (e.which == 13) {
        checkLoginInfo();
        return false;
    }
});
$('#login-password').keypress((e) => {
    if (e.which == 13) {
        checkLoginInfo();
        return false;
    }
});