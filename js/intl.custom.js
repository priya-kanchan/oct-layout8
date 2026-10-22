/* Country-code picker for every .phone-input.
   Keeps the hidden field named in data-countrycode-id (e.g. qCountryCode4)
   in sync with the selected dial code so SubmitQueryData can read it. */
(function () {
    if (!window.intlTelInput) return;

    document.querySelectorAll('.phone-input').forEach(function (input) {
        var iti = window.intlTelInput(input, {
            initialCountry: 'in',
            preferredCountries: ['in', 'ae', 'us', 'gb', 'sg', 'sa', 'qa'],
            separateDialCode: true,
            autoPlaceholder: 'off',
            dropdownContainer: document.body
        });

        var hidden = document.getElementById(input.getAttribute('data-countrycode-id'));

        function syncCode() {
            var data = iti.getSelectedCountryData();
            if (hidden && data && data.dialCode) hidden.value = '+' + data.dialCode;
        }

        syncCode();
        input.addEventListener('countrychange', syncCode);

        // Digits only, max 15 (E.164 limit).
        input.addEventListener('input', function () {
            var clean = input.value.replace(/\D/g, '').slice(0, 15);
            if (clean !== input.value) input.value = clean;
        });
    });
})();
