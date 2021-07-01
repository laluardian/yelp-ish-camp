;(function () {
  'use strict'

  // initialize bs-custom-file-input package
  bsCustomFileInput.init()

  // fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.validated-form')

  // loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener(
      'submit',
      event => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
        form.classList.add('was-validated')
      },
      false
    )
  })
})()
