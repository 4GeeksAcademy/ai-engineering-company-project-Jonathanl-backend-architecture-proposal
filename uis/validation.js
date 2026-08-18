(function () {
  const form = document.getElementById("application-form");
  const successMessage = document.getElementById("success-message");

  const fields = {
    fullName: document.getElementById("fullName"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    country: document.getElementById("country"),
    experience: document.getElementById("experience"),
    sector: document.getElementById("sector"),
    englishLevel: document.getElementById("englishLevel"),
    linkedin: document.getElementById("linkedin"),
    comments: document.getElementById("comments"),
    policy: document.getElementById("policy"),
    commentsCounter: document.getElementById("comments-counter"),
  };

  const availabilityOptions = document.querySelectorAll('input[name="availability"]');

  if (!form) {
    return;
  }

  const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    phone: /^\+\d{1,4}(?:[\s-]?\d){6,14}$/,
    url: /^https?:\/\/.+/i,
  };

  function getErrorNode(fieldName) {
    return document.getElementById(`error-${fieldName}`);
  }

  function setInvalidState(fieldName, isInvalid) {
    if (fieldName === "availability") {
      availabilityOptions.forEach(function (option) {
        option.setAttribute("aria-invalid", isInvalid ? "true" : "false");
      });
      return;
    }

    const field = fields[fieldName];
    if (field) {
      field.setAttribute("aria-invalid", isInvalid ? "true" : "false");
    }
  }

  function setError(fieldName, message) {
    const node = getErrorNode(fieldName);
    if (node) {
      node.textContent = message;
    }
    setInvalidState(fieldName, Boolean(message));
  }

  function clearError(fieldName) {
    setError(fieldName, "");
  }

  function selectedAvailability() {
    return document.querySelector('input[name="availability"]:checked');
  }

  function validateFullName() {
    const value = fields.fullName.value.trim();
    const parts = value.split(/\s+/).filter(Boolean);
    if (parts.length < 2) {
      setError("fullName", "El nombre debe contener al menos nombre y apellido");
      return false;
    }
    clearError("fullName");
    return true;
  }

  function validateEmail() {
    const value = fields.email.value.trim();
    if (!patterns.email.test(value)) {
      setError("email", "Ingresa un email válido (ejemplo: <nombre@empresa.com>)");
      return false;
    }
    clearError("email");
    return true;
  }

  function validatePhone() {
    const value = fields.phone.value.trim();
    if (!patterns.phone.test(value)) {
      setError("phone", "El teléfono debe incluir código de país (ejemplo: +34 612 345 678)");
      return false;
    }
    clearError("phone");
    return true;
  }

  function validateCountry() {
    if (!fields.country.value) {
      setError("country", "Selecciona tu país de residencia");
      return false;
    }
    clearError("country");
    return true;
  }

  function validateExperience() {
    const rawValue = fields.experience.value.trim();
    const value = Number(rawValue);
    if (!rawValue || Number.isNaN(value) || value < 0 || value > 50) {
      setError("experience", "Los años de experiencia deben estar entre 0 y 50");
      return false;
    }
    clearError("experience");
    return true;
  }

  function validateSector() {
    if (!fields.sector.value) {
      setError("sector", "Selecciona el sector de tu interés");
      return false;
    }
    clearError("sector");
    return true;
  }

  function validateEnglishLevel() {
    if (!fields.englishLevel.value) {
      setError("englishLevel", "Indica tu nivel de inglés");
      return false;
    }
    clearError("englishLevel");
    return true;
  }

  function validateAvailability() {
    if (!selectedAvailability()) {
      setError("availability", "Selecciona tu disponibilidad");
      return false;
    }
    clearError("availability");
    return true;
  }

  function validateLinkedin() {
    const value = fields.linkedin.value.trim();
    if (value && !patterns.url.test(value)) {
      setError("linkedin", "Si incluyes LinkedIn, debe ser una URL válida");
      return false;
    }
    clearError("linkedin");
    return true;
  }

  function updateCommentsCounter() {
    const maxLength = 500;
    const length = fields.comments.value.length;
    const remaining = maxLength - length;
    fields.commentsCounter.textContent = `Quedan ${remaining} caracteres`;
    return remaining;
  }

  function validateComments() {
    const remaining = updateCommentsCounter();
    if (remaining < 0) {
      setError("comments", `Los comentarios no pueden exceder 500 caracteres (quedan ${remaining})`);
      return false;
    }
    clearError("comments");
    return true;
  }

  function validatePolicy() {
    if (!fields.policy.checked) {
      setError("policy", "Debes aceptar la política de tratamiento de datos para continuar");
      return false;
    }
    clearError("policy");
    return true;
  }

  function clearAllErrors() {
    clearError("fullName");
    clearError("email");
    clearError("phone");
    clearError("country");
    clearError("experience");
    clearError("sector");
    clearError("englishLevel");
    clearError("availability");
    clearError("linkedin");
    clearError("comments");
    clearError("policy");
  }

  function validateForm() {
    const checks = [
      { valid: validateFullName(), field: fields.fullName },
      { valid: validateEmail(), field: fields.email },
      { valid: validatePhone(), field: fields.phone },
      { valid: validateCountry(), field: fields.country },
      { valid: validateExperience(), field: fields.experience },
      { valid: validateSector(), field: fields.sector },
      { valid: validateEnglishLevel(), field: fields.englishLevel },
      { valid: validateAvailability(), field: availabilityOptions[0] },
      { valid: validateLinkedin(), field: fields.linkedin },
      { valid: validateComments(), field: fields.comments },
      { valid: validatePolicy(), field: fields.policy },
    ];

    const firstInvalid = checks.find(function (check) {
      return !check.valid;
    });

    return {
      isValid: checks.every(function (check) {
        return check.valid;
      }),
      firstInvalidField: firstInvalid ? firstInvalid.field : null,
    };
  }

  fields.fullName.addEventListener("blur", validateFullName);
  fields.email.addEventListener("blur", validateEmail);
  fields.phone.addEventListener("blur", validatePhone);
  fields.country.addEventListener("change", validateCountry);
  fields.experience.addEventListener("blur", validateExperience);
  fields.sector.addEventListener("change", validateSector);
  fields.englishLevel.addEventListener("change", validateEnglishLevel);
  fields.linkedin.addEventListener("blur", validateLinkedin);
  fields.comments.addEventListener("input", validateComments);
  fields.policy.addEventListener("change", validatePolicy);
  availabilityOptions.forEach(function (option) {
    option.addEventListener("change", validateAvailability);
  });

  updateCommentsCounter();

  clearAllErrors();

  form.addEventListener("reset", function () {
    clearAllErrors();
    if (successMessage) {
      successMessage.classList.add("hidden");
    }
    requestAnimationFrame(function () {
      updateCommentsCounter();
      fields.fullName.focus();
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const validationResult = validateForm();

    if (validationResult.isValid) {
      form.reset();
      if (successMessage) {
        successMessage.classList.remove("hidden");
      }
      updateCommentsCounter();
      form.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (validationResult.firstInvalidField) {
      validationResult.firstInvalidField.focus();
    }
  });
})();
