document.addEventListener('DOMContentLoaded', function() 
{
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
	if (document.getElementById("text"))
	{
		animation("text", "hello, world");
	}
});

function toggleTheme()
{
    document.body.classList.toggle('dark-mode');

    // Save preference to localStorage
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

function showMessage()
{
    alert("hello! thanks for clicking.");
}

function isValidEmail(email)
{
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
}

function submitForm()
{
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
        alert("Please fill all fields: Name, Email, and Message.");
        return;
    }

    if (!isValidEmail(email)) {
        alert("Please enter a valid email address (e.g., example@gmail.com)");
        return;
    }

    const recipient = 'mail@tristanlee.net';
    const subject = encodeURIComponent(`Contact from Website - ${name} (${email})`);
    const body = encodeURIComponent(
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `${message}`
    );
    const mailtoLink = `mailto:${recipient}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
    alert("Preparing your message. Your email client will now open. Thanks, " + name + "!");
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('message').value = '';
}


function animation(elementId, text)
{
	const el = document.getElementById(elementId);
	let 
		i = 0, 
		erase = false, 
		pause = false;

	function type_rate()
	{
		// Case 1 : Pause
		if (pause)
		{
			return;
		}

		// Case 2 : Erase
		if (erase)
		{
			el.textContent = text.slice(0, --i);
			if (i === 0)
			{
				pause = true;
				setTimeout(start_pause_time, 2000)
			}
		}
		// Case 3 : Type
		else
		{
			el.textContent = text.slice(0, ++i);
			if (i === text.length)
			{
				pause = true;
				setTimeout(end_pause_time,2000);
			}
		}
	}
	setInterval(type_rate,150);

	function start_pause_time()
	{
		erase = false;
		pause = false;
	}

	function end_pause_time()
	{
		erase = true;
		pause = false;
	}
}
