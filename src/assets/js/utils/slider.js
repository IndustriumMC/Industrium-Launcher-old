/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

'use strict';

export default class Slider {
    constructor(id, minValue, maxValue) {
        this.startX = 0;
        this.x = 0;

        this.slider = document.querySelector(id);
        this.touchLeft = this.slider.querySelector('.slider-touch-left');
        this.touchRight = this.slider.querySelector('.slider-touch-right');
        this.lineSpan = this.slider.querySelector('.slider-line span');

        this.min = parseFloat(this.slider.getAttribute('min'));
        this.max = parseFloat(this.slider.getAttribute('max'));

        if (!minValue) minValue = this.min;
        if (!maxValue) maxValue = this.max;

        this.minValue = minValue;
        this.maxValue = maxValue;

        this.step = parseFloat(this.slider.getAttribute('step'));

        this.normalizeFact = 18;

        this.reset();

        this.maxX = this.slider.offsetWidth - this.touchRight.offsetWidth;
        this.selectedTouch = null;
        this.initialValue = this.lineSpan.offsetWidth - this.normalizeFact;

        this.setMinValue(this.minValue);
        this.setMaxValue(this.maxValue);

        this.touchLeft.addEventListener('mousedown', (event) => this.onStart(document.querySelector('.slider-touch-left'), event));
        this.touchRight.addEventListener('mousedown', (event) => this.onStart(document.querySelector('.slider-touch-right'), event));
        this.touchLeft.addEventListener('touchstart', (event) => this.onStart(document.querySelector('.slider-touch-left'), event));
        this.touchRight.addEventListener('touchstart', (event) => this.onStart(document.querySelector('.slider-touch-right'), event));
    }

    reset() {
        this.touchLeft.style.left = '0px';
        this.touchRight.style.left = (this.slider.offsetWidth - this.touchLeft.offsetWidth) + 'px';
        this.lineSpan.style.marginLeft = '0px';
        this.lineSpan.style.width = (this.slider.offsetWidth - this.touchLeft.offsetWidth) + 'px';
        this.startX = 0;
        this.x = 0;
    }

    setMinValue(minValue) {
        let ratio = (minValue - this.min) / (this.max - this.min);
        this.touchLeft.style.left = Math.ceil(ratio * (this.slider.offsetWidth - (this.touchLeft.offsetWidth + this.normalizeFact))) + 'px';
        this.lineSpan.style.marginLeft = this.touchLeft.offsetLeft + 'px';
        this.lineSpan.style.width = (this.touchRight.offsetLeft - this.touchLeft.offsetLeft) + 'px';
    }

    setMaxValue(maxValue) {
        var ratio = (maxValue - this.min) / (this.max - this.min);
        this.touchRight.style.left = Math.ceil(ratio * (this.slider.offsetWidth - (this.touchLeft.offsetWidth + this.normalizeFact)) + this.normalizeFact) + 'px';
        this.lineSpan.style.marginLeft = this.touchLeft.offsetLeft + 'px';
        this.lineSpan.style.width = (this.touchRight.offsetLeft - this.touchLeft.offsetLeft) + 'px';
    }

    onStart(elem, event) {
        event.preventDefault();

        if (elem === this.touchLeft)
            this.x = this.touchLeft.offsetLeft;
        else
            this.x = this.touchRight.offsetLeft;

        this.startX = event.pageX - this.x;
        this.selectedTouch = elem;

        let self = this;
        this.func1 = (event) => { this.onMove(event) };
        this.func2 = (event) => { this.onStop(event) };

        document.addEventListener('mousemove', this.func1);
        document.addEventListener('mouseup', this.func2);
        document.addEventListener('touchmove', this.func1);
        document.addEventListener('touchend', this.func2);
    }

    onMove(event) {
        this.x = event.pageX - this.startX;

        if (this.selectedTouch === this.touchLeft) {
            if (this.x > this.touchRight.offsetLeft - this.selectedTouch.offsetWidth - 24)
                this.x = this.touchRight.offsetLeft - this.selectedTouch.offsetWidth - 24;
            else if (this.x < 0)
                this.x = 0;

            this.selectedTouch.style.left = this.x + 'px';
        } else if (this.selectedTouch === this.touchRight) {
            if (this.x < this.touchLeft.offsetLeft + this.touchLeft.offsetWidth + 24) {
                this.x = this.touchLeft.offsetLeft + this.touchLeft.offsetWidth + 24;
            } else if (this.x > this.maxX)
                this.x = this.maxX;

            this.selectedTouch.style.left = this.x + 'px';
        }

        this.lineSpan.style.marginLeft = this.touchLeft.offsetLeft + 'px';
        this.lineSpan.style.width = this.touchRight.offsetLeft - this.touchLeft.offsetLeft + 'px';

        this.calculateValue();
    }

    onStop(self, event) {
        document.removeEventListener('mousemove', this.func1);
        document.removeEventListener('mouseup', this.func2);
        document.removeEventListener('touchmove', this.func1);
        document.removeEventListener('touchend', this.func2);

        this.selectedTouch = null;

        this.calculateValue();
    }

    calculateValue() {
        // Obtenir les positions actuelles des sliders
        const leftPosition = this.touchLeft.offsetLeft;
        const rightPosition = this.touchRight.offsetLeft;
        const width = this.slider.offsetWidth - this.touchLeft.offsetWidth;
        
        // Calculer les valeurs en pourcentage (0-1) en fonction des positions
        const minValue = Math.max(0, leftPosition / width);
        const maxValue = Math.max(minValue + 0.1, rightPosition / width);
        
        // Convertir les pourcentages en valeurs réelles dans la plage [min, max]
        const realMinValue = this.min + minValue * (this.max - this.min);
        const realMaxValue = this.min + maxValue * (this.max - this.min);
        
        // Arrondir selon le pas (step)
        if (this.step != 0) {
            this.minValue = Math.max(this.min, Math.round(realMinValue / this.step) * this.step);
            this.maxValue = Math.min(this.max, Math.max(this.minValue + this.step, Math.round(realMaxValue / this.step) * this.step));
        } else {
            this.minValue = Math.max(this.min, realMinValue);
            this.maxValue = Math.min(this.max, Math.max(this.minValue + 0.1, realMaxValue));
        }
        
        // S'assurer que les valeurs restent dans les limites
        this.minValue = Math.max(this.min, Math.min(this.max, this.minValue));
        this.maxValue = Math.max(this.min, Math.min(this.max, this.maxValue));
        
        // Émettre l'événement de changement
        this.emit('change', this.minValue, this.maxValue);
    }

    func = [];

    on(name, func) {
        this.func[name] = func;
    }

    emit(name, ...args) {
        if (this.func[name]) this.func[name](...args);
    }
}