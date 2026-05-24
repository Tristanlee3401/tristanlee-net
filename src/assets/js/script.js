const html = document.documentElement
const button = document.getElementById('themeToggle');

document.addEventListener('DOMContentLoaded', function()
{
	const savedTheme = localStorage.getItem('theme');

	if (savedTheme === 'dark')
	{
		html.classList.add('dark');
	}

	// Set initial button label
	if (button)
	{
		if (html.classList.contains('dark'))
		{
			button.textContent = 'dark to light';
		}
		else
		{
			button.textContent = 'light to dark';
		}
	}

	// Start animation if on index
	if (document.getElementById("text"))
	{
		animateText("hello, world");
	}
});

function toggleTheme()
{
	const itWasDark = html.classList.contains('dark');

	html.classList.toggle('dark');
	
	// Saves new theme to localStorage
	if (itWasDark)
	{
		localStorage.setItem('theme', 'light');
	}
	else
	{
		localStorage.setItem('theme', 'dark');
	}

	// Updates button text label
	if (button) 
	{
		if (itWasDark)
		{
			button.textContent = 'light to dark';
		}
		else
		{
			button.textContent = 'dark to light';
		}
	}
}

function isValidEmail(email)
{
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
}

function submitForm()
{
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    const messageField = document.getElementById('message');

    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const message = messageField.value.trim();

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
    nameField.value = '';
    emailField.value = '';
    messageField.value = '';
}

function animateText(text)
{
	const element = document.getElementById("text");
	let 
		i = 0, 
		erase = false, 
		pause = false;

	function typeRate()
	{
		// Case 1 : Pause
		if (pause)
		{
			return;
		}

		// Case 2 : Erase
		if (erase)
		{
			element.textContent = text.slice(0, --i);
			if (i === 0)
			{
				pause = true;
				setTimeout(startPauseTime, 4000)
			}
		}
		// Case 3 : Type
		else
		{
			element.textContent = text.slice(0, ++i);
			if (i === text.length)
			{
				pause = true;
				setTimeout(endPauseTime,4000);
			}
		}
	}
	setInterval(typeRate,150);

	function startPauseTime()
	{
		erase = false;
		pause = false;
	}

	function endPauseTime()
	{
		erase = true;
		pause = false;
	}
}
