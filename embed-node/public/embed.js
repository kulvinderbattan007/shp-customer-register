console.log("✅ Styled Multi-step Form Loaded");

window.MyForm = {
  init: function ({ target }) {
    const container = document.querySelector(target);
    if (!container) return;

    let step = 1;
    const data = {};

    // ---------- MAIN WRAPPER ----------
    const wrapper = document.createElement("div");
    wrapper.style.maxWidth = "800px";
    wrapper.style.fontFamily = "Arial, sans-serif";
    wrapper.style.background = "#f5f2ec";
    wrapper.style.padding = "30px";

    // ---------- STYLES ----------
    const style = document.createElement("style");
    style.innerHTML = `
      .form-row {
        display: flex;
        gap: 20px;
        margin-bottom: 15px;
      }
      .form-group {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      input, select, textarea {
        padding: 10px;
        border: 1px solid #ccc;
        font-size: 14px;
        width: 100%;
      }
      input.error {
        border: 1px solid red;
        background: #ffecec;
      }
      label {
        font-size: 13px;
        margin-bottom: 5px;
      }
      h4 {
        margin: 20px 0 10px;
      }
      .buttons {
        margin-top: 20px;
        display: flex;
        gap: 10px;
      }
      .btn {
        padding: 10px 20px;
        background: #a3472b;
        color: white;
        border: none;
        cursor: pointer;
      }
      .btn.secondary {
        background: #8a3c26;
      }
      .radio-group label {
        display: block;
        margin-bottom: 8px;
      }
    `;
    document.head.appendChild(style);

    function render() {
      wrapper.innerHTML = `<h3>Step ${step} of 4</h3>`;
      const form = document.createElement("form");

      // ---------- STEP 1 ----------
      if (step === 1) {
        form.innerHTML += `
          <h4>PRIMARY CONTACT DETAILS</h4>
          <div class="form-row">
            <div class="form-group">
              <label>First name *</label>
              <input name="firstName" required>
            </div>
            <div class="form-group">
              <label>Last name *</label>
              <input name="lastName" required>
            </div>
          </div>

          <h4>ACCOUNT CREDENTIALS</h4>
          <div class="form-row">
            <div class="form-group">
              <label>Email *</label>
              <input name="email" required>
            </div>
            <div class="form-group">
              <label>Confirm email *</label>
              <input name="confirmEmail" required>
            </div>
          </div>
        `;
      }

      // ---------- STEP 2 ----------
      if (step === 2) {
        form.innerHTML += `
          <h4>BUSINESS DETAILS</h4>

          <div class="form-row">
            <div class="form-group">
              <label>Address line 1 *</label>
              <input name="address1" required>
            </div>
            <div class="form-group">
              <label>Address line 2</label>
              <input name="address2">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>City *</label>
              <input name="city" required>
            </div>
            <div class="form-group">
              <label>Postal Code *</label>
              <input name="postal" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Business name *</label>
              <input name="business" required>
            </div>
            <div class="form-group">
              <label>Website *</label>
              <input name="website" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Phone *</label>
              <input name="phone" required>
            </div>
          </div>
        `;
      }

      // ---------- STEP 3 ----------
      if (step === 3) {
        form.innerHTML += `
          <h4>MORE DETAILS</h4>

          <div class="radio-group">
            <label><input type="radio" name="type" value="Wholesale" required> Wholesale</label>
            <label><input type="radio" name="type" value="Guesthouse"> Guesthouse</label>
            <label><input type="radio" name="type" value="Trade"> Trade</label>
          </div>

          <div class="form-group">
            <label>Instagram Account *</label>
            <input name="instagram" required>
          </div>

          <div class="form-group">
            <label>Anything else?</label>
            <textarea name="notes"></textarea>
          </div>
        `;
      }

      // ---------- STEP 4 ----------
      if (step === 4) {
        form.innerHTML += `
          <h4>TAXES AND TERMS</h4>

          <div class="radio-group">
            <label><input type="radio" name="gst" value="yes" required> Yes</label>
            <label><input type="radio" name="gst" value="no"> No</label>
          </div>

          <div class="form-group">
            <label><input type="checkbox" name="marketing"> Email marketing</label>
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" name="terms" required>
              I agree to Terms *
            </label>
          </div>
        `;
      }

      // ---------- BUTTONS ----------
      const btns = document.createElement("div");
      btns.className = "buttons";

      if (step > 1) {
        const back = document.createElement("button");
        back.type = "button";
        back.className = "btn secondary";
        back.innerText = "BACK";
        back.onclick = () => {
          step--;
          render();
        };
        btns.appendChild(back);
      }

      const next = document.createElement("button");
      next.type = "submit";
      next.className = "btn";
      next.innerText = step === 4 ? "SUBMIT" : "NEXT";
      btns.appendChild(next);

      form.appendChild(btns);

      // ---------- VALIDATION ----------
      form.onsubmit = async (e) => {
        e.preventDefault();

        let valid = true;

        form.querySelectorAll("input[required]").forEach(input => {
          if (
            (input.type === "radio" && !form.querySelector(`input[name="${input.name}"]:checked`)) ||
            (input.type !== "radio" && !input.value)
          ) {
            input.classList.add("error");
            valid = false;
          } else {
            input.classList.remove("error");
          }
        });

        // email match
        const email = form.querySelector('[name="email"]');
        const confirm = form.querySelector('[name="confirmEmail"]');
        if (email && confirm && email.value !== confirm.value) {
          confirm.classList.add("error");
          valid = false;
        }

        if (!valid) return;

        // Save values
        form.querySelectorAll("input, textarea").forEach(input => {
          if (input.type === "radio") {
            if (input.checked) data[input.name] = input.value;
          } else if (input.type === "checkbox") {
            data[input.name] = input.checked;
          } else {
            data[input.name] = input.value;
          }
        });

        if (step < 4) {
          step++;
          render();
        } else {
          submit();
        }
      };

      wrapper.appendChild(form);
      container.appendChild(wrapper);
    }

    async function submit() {
      console.log("data",data);
      // return;
      try {
        const res = await fetch("http://localhost:3000/form/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        const result = await res.json();
      console.log("result", result);  
return;

        wrapper.innerHTML = result.success
          ? "<h3>✅ Registration Successful</h3>"
          : `<h3>❌ ${result.errors?.[0]?.message || "Error"}</h3>`;
      } catch (err) {
        console.error(err);
      }
    }

    render();
  }
};











// console.log("✅ Embed script loaded");

// window.MyForm = {
//   init: async function ({ formId, target }) {
//     const container = document.querySelector(target);

//     if (!container) {
//       console.error("❌ Target not found:", target);
//       return;
//     }

//     try {
//       const res = await fetch(`http://localhost:3000/form/${formId}`);
//       const data = await res.json();

//       const form = document.createElement("form");
//       form.style.border = "1px solid #ccc";
//       form.style.padding = "20px";
//       form.style.maxWidth = "300px";

//       data.fields.forEach(field => {
//         const input = document.createElement("input");
//         input.type = field.type;
//         input.placeholder = field.label;
//         input.name = field.name;
//         input.required = true;
//         input.style.display = "block";
//         input.style.margin = "10px 0";
//         input.style.width = "100%";
//         input.style.padding = "8px";
//         form.appendChild(input);
//       });

//       const btn = document.createElement("button");
//       btn.innerText = "Registessr";
//       btn.style.padding = "10px";
//       btn.style.width = "100%";

//     //   btn.innerText = "Register";
// btn.type = "submit"; // ✅ ADD THIS (IMPORTANT)

//       form.appendChild(btn);

      

//       const message = document.createElement("p");
//       message.style.marginTop = "10px";

//       form.onsubmit = async (e) => {
//         e.preventDefault();
// console.log("ss");
//         const values = {};
//         form.querySelectorAll("input").forEach(input => {
//           values[input.name] = input.value;
//         });

//         message.innerText = "Submitting...";
//         message.style.color = "black";

//         const res = await fetch(`http://localhost:3000/form/submit`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json"
//           },
//           body: JSON.stringify(values)
//         });

//         const result = await res.json();
// console.log(result);
// // alert("fffsf");
//         if (result.success) {
//           message.innerText = "✅ Registered successfully!";
//           message.style.color = "green";
//           form.reset();
//         } else {
//           message.innerText =
//             result.errors?.[0]?.message || "❌ Error occurred";
//           message.style.color = "red";
//         }
//       };

//       container.appendChild(form);
//       container.appendChild(message);

//     } catch (err) {
//       console.error("❌ Error loading form:", err);
//     }
//   }
// };