/********** CONFIG **********/
const SHEET_URL = "https://script.google.com/macros/s/AKfycbxjHtDi4tboxJHLRhrV95Ip2v9KSR1oxw6DzY0WcoNNs9s471g5-Q7_dh_eIW1wOVJt/exec";

/********** ELEMENTLAR **********/
const signupBox = document.getElementById('signupBox');
const loginBox = document.getElementById('loginBox');
const toLogin = document.getElementById('toLogin');
const toSignup = document.getElementById('toSignup');

const signupBtn = document.getElementById('signupBtn');
const loginBtn = document.getElementById('loginBtn');

const signupMsg = document.getElementById('signupMsg');
const loginMsg = document.getElementById('loginMsg');

/********** TOGGLE LOGIN / SIGNUP **********/
toLogin.onclick = () => {
    signupBox.classList.add('hidden');
    loginBox.classList.remove('hidden');
    signupMsg.textContent = '';
    loginMsg.textContent = '';
};

toSignup.onclick = () => {
    loginBox.classList.add('hidden');
    signupBox.classList.remove('hidden');
    signupMsg.textContent = '';
    loginMsg.textContent = '';
};

/********** RO‘YXATDAN O‘TISH **********/
signupBtn.onclick = () => {
    const fam = document.getElementById('familya').value.trim();
    const ism = document.getElementById('ism').value.trim();
    const phone = document.getElementById('phoneSign').value.trim();
    const pass = document.getElementById('passSign').value.trim();

    if (!fam || !ism || !phone || !pass) {
        signupMsg.style.color = 'red';
        signupMsg.textContent = "Barcha maydonlarni to'ldiring";
        return;
    }

    fetch(SHEET_URL, {
        method: "POST",
        body: JSON.stringify({
            action: "signup",
            fam,
            ism,
            phone,
            pass
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "ok") {
                localStorage.setItem("userPhone", phone);
                signupMsg.style.color = 'green';
                signupMsg.textContent = "Ro'yxatdan o'tish muvaffaqiyatli! Kirish qismiga o'ting";

                document.getElementById('familya').value = '';
                document.getElementById('ism').value = '';
                document.getElementById('phoneSign').value = '';
                document.getElementById('passSign').value = '';
            } else {
                signupMsg.style.color = 'red';
                signupMsg.textContent = "Xato yuz berdi!";
            }
        })
        .catch(err => {
            signupMsg.style.color = 'red';
            signupMsg.textContent = "Xato yuz berdi!";
            console.error(err);
        });
};

/********** KIRISH **********/
loginBtn.onclick = () => {
    const phone = document.getElementById('phoneLogin').value.trim();
    const pass = document.getElementById('passLogin').value.trim();

    if (!phone || !pass) {
        loginMsg.style.color = 'red';
        loginMsg.textContent = "Barcha maydonlarni to'ldiring";
        return;
    }

    fetch(SHEET_URL, {
        method: "POST",
        body: JSON.stringify({
            action: "login",
            phone,
            pass
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "ok") {

                // 🔥 FOYDALANUVCHINI SAQLAB QO‘YAMIZ
                localStorage.setItem("user", JSON.stringify({
                    fam: data.fam,
                    ism: data.ism,
                    phone: data.phone
                }));

                loginMsg.style.color = 'green';
                loginMsg.textContent = "Kirish muvaffaqiyatli!";

                setTimeout(() => {
                    window.location.href = "bosh_sahifa.html";
                }, 500);

            } else {
                loginMsg.style.color = 'red';
                loginMsg.textContent = "Telefon yoki parol noto‘g‘ri";
            }
        })
        .catch(err => {
            loginMsg.style.color = 'red';
            loginMsg.textContent = "Xato yuz berdi!";
            console.error(err);
        });
};
