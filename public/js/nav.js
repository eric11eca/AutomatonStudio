document.getElementById("home").addEventListener('click', (e) => {
	e.preventDefault();
	fetch("/", {
			method: "POST",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json"
			}
		})
		.then((response) => response.text())
		.then((data) => {
			window.location = (JSON.parse(data).redirect);
		})
		.catch((err) => {
			error.innerHTML = err;
			error.style.display = "block";
		});
});

document.getElementById("logic").addEventListener('click', (e) => {
	e.preventDefault();
	fetch("/truth", {
			method: "POST",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json"
			}
		})
		.then((response) => response.text())
		.then((data) => {
			window.location = (JSON.parse(data).redirect);
		})
		.catch((err) => {
			error.innerHTML = err;
			error.style.display = "block";
		});
});

document.getElementById("fsm").addEventListener('click', (e) => {
	e.preventDefault();
	fetch("/fsm", {
			method: "POST",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json"
			}
		})
		.then((response) => response.text())
		.then((data) => {
			window.location = (JSON.parse(data).redirect);
		})
		.catch((err) => {
			error.innerHTML = err;
			error.style.display = "block";
		});
});