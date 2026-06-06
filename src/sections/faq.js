/**
 * FAQ section — interactive accordion for client doubts.
 */
export function initFaq() {
  const section = document.getElementById('faq');
  if (!section) return;

  const faqs = [
    {
      q: {
        en: 'How long does it take to deliver a design?',
        es: '¿Cuánto tiempo tardas en entregar un diseño?'
      },
      a: {
        en: 'It depends on the complexity and the current waiting list, but normally between 2 and 4 business days.',
        es: 'Depende de la complejidad y la lista de espera actual, pero normalmente entre 2 y 4 días hábiles.'
      }
    },
    {
      q: {
        en: 'How do revisions or changes work?',
        es: '¿Cómo funcionan las revisiones o cambios?'
      },
      a: {
        en: 'There is no limit to changes. Any revision requested by the client will be made. Mostly at the time of payment, a sketch is made and shared with the client (as a base idea), depending on the required style. The client has the freedom to make any change they like.',
        es: 'No hay límite de cambios. Se le enviará cualquier revisión que requiera el cliente. Más que nada en la hora que él paga, se empieza a elaborar un borrador en el cual se le compartirá al cliente (como una idea base), dependiendo del estilo que requiera. El cliente tiene la libertad de hacer cualquier cambio que guste.'
      }
    },
    {
      q: {
        en: 'Do you provide the source files (PSD or .blend)?',
        es: '¿Entregas los archivos editables (PSD o .blend)?'
      },
      a: {
        en: 'By default I deliver the final high resolution image (.PNG or .JPG). The source files have an additional cost that we can negotiate.',
        es: 'Por defecto entrego la imagen final en alta resolución (.PNG o .JPG). Los archivos editables tienen un costo adicional que podemos negociar.'
      }
    },
    {
      q: {
        en: 'Do I have to pay upfront?',
        es: '¿Tengo que pagar por adelantado?'
      },
      a: {
        en: 'Normally I ask for a 50% advance to schedule your order, and the remaining 50% when the final design is approved and ready to be sent. But it is recommended to give the full payment (as it suits the client).',
        es: 'Normalmente pido un anticipo del 50% para agendar tu pedido, y el restante 50% cuando el diseño final está aprobado y listo para enviarse. Pero lo recomendable es dar el pago completo (como se acomode el cliente).'
      }
    }
  ];

  section.innerHTML = `
    <div class="container" style="max-width: 800px; margin: 0 auto; padding: 0 var(--container-padding);">
      <div class="section__header fade-up" style="text-align: center;">
        <span class="section__tag"><span class="lang-en">Got Doubts?</span><span class="lang-es">¿Tienes Dudas?</span></span>
        <h2 class="section__title"><span class="lang-en">Frequently Asked <span class="text-gradient">Questions</span></span><span class="lang-es">Preguntas <span class="text-gradient">Frecuentes</span></span></h2>
      </div>
      
      <div class="faq__list stagger-children fade-up" style="margin-top: 40px;">
        ${faqs.map((faq, index) => `
          <div class="faq__item" style="border-bottom: 1px solid var(--border-color); padding: 24px 0;">
            <button class="faq__question" aria-expanded="false" style="width: 100%; display: flex; justify-content: space-between; align-items: center; background: none; border: none; padding: 0; cursor: pointer; color: var(--text-primary); font-family: var(--font-display); font-size: 1.2rem; font-weight: 600; text-align: left;">
              <span><span class="lang-en">${faq.q.en}</span><span class="lang-es">${faq.q.es}</span></span>
              <svg class="faq__icon" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" style="transition: transform 0.3s ease; flex-shrink: 0; margin-left: 16px;"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div class="faq__answer" style="max-height: 0; overflow: hidden; transition: max-height 0.4s ease, margin-top 0.4s ease;">
              <p style="color: var(--text-secondary); line-height: 1.6; margin: 0; padding-top: 16px;">
                <span class="lang-en">${faq.a.en}</span><span class="lang-es">${faq.a.es}</span>
              </p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Add interactivity
  const faqItems = section.querySelectorAll('.faq__item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');
    const icon = item.querySelector('.faq__icon');
    
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      
      // Close all others
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
          otherItem.querySelector('.faq__answer').style.maxHeight = '0';
          otherItem.querySelector('.faq__icon').style.transform = 'rotate(0deg)';
        }
      });
      
      // Toggle current
      if (isExpanded) {
        btn.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = '0';
        icon.style.transform = 'rotate(0deg)';
      } else {
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 40 + 'px';
        icon.style.transform = 'rotate(180deg)';
      }
    });
  });
}
