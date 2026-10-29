const prices = {
      "Standard Room": 1500,
      "Deluxe Room": 2500,
      "Luxury Suite": 4000
    };
    const form = document.getElementById("bookingForm");
    const roomType = document.getElementById("roomType");
    const checkIn = document.getElementById("checkIn");
    const checkOut = document.getElementById("checkOut");
    const estimate = document.getElementById("estimate");
    const formMessage = document.getElementById("formMessage");
    const today = new Date();
    const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    checkIn.min = localToday;
    checkOut.min = localToday;

    function getNights() {
      if (!checkIn.value || !checkOut.value) return 0;
      const start = new Date(checkIn.value + "T00:00:00");
      const end = new Date(checkOut.value + "T00:00:00");
      return Math.round((end - start) / 86400000);
    }
    function updateEstimate() {
      const nights = getNights();
      if (nights <= 0) {
        estimate.textContent = "Estimated total: ₹0 (select valid check-in and check-out dates)";
        return;
      }
      const total = prices[roomType.value] * nights;
      estimate.textContent = `Estimated total: ₹${total.toLocaleString("en-IN")} (${nights} night${nights === 1 ? "" : "s"})`;
    }
    checkIn.addEventListener("change", () => {
      checkOut.min = checkIn.value || localToday;
      if (checkOut.value && checkOut.value <= checkIn.value) checkOut.value = "";
      updateEstimate();
    });
    checkOut.addEventListener("change", updateEstimate);
    roomType.addEventListener("change", updateEstimate);

    document.querySelectorAll(".choose-room").forEach(button => {
      button.addEventListener("click", () => {
        roomType.value = button.dataset.room;
        updateEstimate();
        document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
      });
    });

    function readBookings() {
      try { return JSON.parse(localStorage.getItem("grandVistaBookings") || "[]"); }
      catch { return []; }
    }
    function saveBookings(bookings) {
      localStorage.setItem("grandVistaBookings", JSON.stringify(bookings));
    }
    function renderBookings() {
      const bookings = readBookings();
      const records = document.getElementById("bookingRecords");
      const empty = document.getElementById("emptyState");
      records.replaceChildren();
      empty.style.display = bookings.length ? "none" : "block";
      bookings.forEach((booking, index) => {
        const item = document.createElement("div");
        item.className = "booking-item";
        const details = document.createElement("div");
        const title = document.createElement("strong");
        title.textContent = `${booking.name} — ${booking.room}`;
        const dates = document.createElement("p");
        dates.textContent = `${booking.checkIn} to ${booking.checkOut} · ${booking.nights} night(s) · ${booking.guests} guest(s)`;
        const cost = document.createElement("p");
        cost.textContent = `Estimated total: ₹${booking.total.toLocaleString("en-IN")}`;
        const contact = document.createElement("p");
        contact.textContent = booking.email + " · " + booking.phone;
        details.append(title, dates, cost, contact);
        const remove = document.createElement("button");
        remove.className = "delete-btn";
        remove.type = "button";
        remove.textContent = "Delete";
        remove.addEventListener("click", () => {
          const latest = readBookings();
          latest.splice(index, 1);
          saveBookings(latest);
          renderBookings();
        });
        item.append(details, remove);
        records.append(item);
      });
    }

    form.addEventListener("submit", event => {
      event.preventDefault();
      formMessage.className = "message";
      const nights = getNights();
      if (nights <= 0) {
        formMessage.textContent = "Please choose a check-out date after the check-in date.";
        formMessage.classList.add("error");
        return;
      }
      const booking = {
        name: document.getElementById("guestName").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        room: roomType.value,
        guests: Number(document.getElementById("guests").value),
        checkIn: checkIn.value,
        checkOut: checkOut.value,
        nights,
        total: prices[roomType.value] * nights
      };
      const bookings = readBookings();
      bookings.push(booking);
      saveBookings(bookings);
      renderBookings();
      formMessage.textContent = "Demo booking saved successfully on this device!";
      formMessage.classList.add("success");
      form.reset();
      checkIn.min = localToday;
      checkOut.min = localToday;
      updateEstimate();
    });

    document.getElementById("clearBookings").addEventListener("click", () => {
      if (confirm("Delete all demo booking records from this browser?")) {
        saveBookings([]);
        renderBookings();
        formMessage.textContent = "All demo records have been cleared.";
        formMessage.className = "message success";
      }
    });
    updateEstimate();
    renderBookings();
