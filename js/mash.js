let lan = 'ua';

const locale = {
    ua: {
        ERROR: 'Помилка',
        SUCCESS: 'Успіх',
        NOTE: 'Примітка',
        'error.validation': "Заповніть всі поля",
        'success.clean': "Поля очищено",
        startGame: "Почати гру",
        processing: "Обробка...",
        partner: 'Партнер',
        job: 'Працюватиму',
        kids: 'Кількість дітей',
        pet: 'Домашня тварина',
        car: 'Машина',
        home: 'Будинок',
        best: "Найкращий",
        average: "Середній",
        worst: "Найгірший",
        clean: "Очистити поля вводу",
        mashInfo: "- Моєю парою буде {partner}.\n\n- Я працюватиму {job}.\n\n- Наш будинок це {home}.\n\n- У нас буде {kids} дітей.\n\n- Я водитиму {car}.\n\n- Наша домашня тварина буде {pet}." ,
    },
    en: {
        ERROR: 'Error',
        SUCCESS: 'Success',
        NOTE: 'Note',
        'error.validation': "Fill in all fields",
        'success.clean': "Fields cleared",
        startGame: "Start game",
        processing: "Processing...",
        partner: 'Partner',
        job: 'Job {name}',
        kids: 'Number of kids',
        pet: 'Pet',
        car: 'Car',
        home: 'Home',
        best: "The best",
        worst: "Worst",
        clean: "Сlean input fields",
        mashInfo: "- My partner will be {partner}.\n\n- I will work {job}.\n\n- Our house is {home}.\n\n- We will have {kids} children.\n\n- I drive a {car}.\n\n- Our pet will be {pet}." ,
    }
};

const t = (key, params = {}) => {
    let text = locale[lan][key] || key;

    text = text.replace(/\{(\w+)\}/g, (match, p1) => 
        params[p1] !== undefined ? params[p1] : match
    );

    return text.replace(/\n/g, '<br>');
}

class Mash extends HTMLElement {
    btnStartGame = undefined;
    btnСleanInpt = undefined
    gameBox = undefined;
    messegeBox = undefined;
    title = undefined;
    isShowMesseg = false;
    errors = [];
    messegeActions = {
        ERROR: 'ERROR',
        SUCCESS: 'SUCCESS',
        NOTE: 'NOTE'
    };
    values = {};
    resultData = {};
    config = {
        attributes: {
            partner: {
                text: t('partner'),
                type: 'text'
            },
            job: {
                text: t('job'),
                type: 'text'
            },
            home: {
                text: t('home'),
                type: 'text'
            },			
            kids: {
                text: t('kids'),
                type: 'num'
            },
            car: {
                text: t('car'),
                type: 'text'
            },
            pet: {
                text: t('pet'),
                type: 'text'
            }
        },
        options: {
            best: {
                text: t('best')
            },
            average: {
                text: t('average'),
            },
            worst: {
                text: t('worst')
            }
        }
    };
    optionKeys = Object.keys(this.config.options);

    constructor() {
        super();
        this.gameBox = this.querySelector('#mash-game-box');
        this.messegeBox = this.querySelector('#mash-message');
        this.title = this.querySelector('#mash-title');
        this.btnStartGame = this.querySelector('#mash-btn-start');
        this.btnСleanInpt = this.querySelector('#mash-btn-clean');
        this.clearMessageTimeout = null;
        this.render();
        this.loadValuesFromStorage();
        this.initButtonsEvents();
        this.initInputEvents();
    }

    render() {
        this.btnСleanInpt.textContent = t('clean');
        this.btnStartGame.textContent = t('startGame');
        this.gameBox.innerHTML = this.addBox();
    }

    inputsActions(callback = null) {
        const inputs = document.querySelectorAll('.mash-game-box-input');

        inputs.forEach(input => {
            const dataValue = input.getAttribute('data-value');
            const dataIndex = input.getAttribute('data-index');

            callback ? callback(input, dataValue, dataIndex) : null;
        });
    }

    loadValuesFromStorage() {
        const stored = localStorage.getItem('mashValues');

        if (stored) {
            this.values = JSON.parse(stored);

            this.inputsActions((input, dataValue, dataIndex) => {
                const key = this.optionKeys[dataIndex];

                if (this.values[dataValue] && this.values[dataValue][key] !== undefined) {
                    input.value = this.values[dataValue][key];
                }
            });
        }
    }

    saveValuesToStorage() {
        localStorage.setItem('mashValues', JSON.stringify(this.values));
    }

    messege(text = '', action = this.messegeActions.ERROR, isShowTitle = true, isHideMassage = true) {
        clearTimeout(this.clearMessageTimeout);
    
        this.messegeBox.className = '';
        this.messegeBox.classList.add(action);
    
        if (isHideMassage) {
            this.clearMessageTimeout = setTimeout(() => {
                this.messegeBox.classList.remove(action);
                this.messegeBox.innerHTML = '';
            }, 5000);
        }

        this.messegeBox.innerHTML = `${isShowTitle ? `${t(action)}: ` : ''}${text}`;
    }

    isValid() {
        return Object.entries(this.values).every((value, index) => {
            if (Object.keys(value[1]).length === 0 || Object.values(value[1]).includes('')) return false;
            else return true;
        });
    }

    initButtonsEvents() {
        this.onBtnClickStartGame = this.onBtnClickStartGame.bind(this);
        this.btnStartGame.addEventListener('click', this.onBtnClickStartGame);
        this.onBtnClickСleanInpt = this.onBtnClickСleanInpt.bind(this);
        this.btnСleanInpt.addEventListener('click', this.onBtnClickСleanInpt);
    }

    initInputEvents() {
        this.inputsActions((input) => {
            input.addEventListener('input', () => {
                this.getValues();
                this.saveValuesToStorage();
            });
        });
    }

    btnPocessting(btn, text = 'processing', isDisabled = true) {
        btn.disabled = isDisabled;
        btn.textContent = t(text);
    }

    onBtnClickStartGame() {
        this.btnPocessting(this.btnStartGame);
        
        setTimeout(() => {
            this.btnPocessting(this.btnStartGame, 'startGame', false);
            this.getValues();

            if (this.isValid()) {
                this.result()
            } else {
                this.messege(t('error.validation'), this.messegeActions.ERROR);
            }
        }, 150);
    }

    onBtnClickСleanInpt() {
        this.btnPocessting(this.btnСleanInpt);
        
        setTimeout(() => {
            this.btnPocessting(this.btnСleanInpt, 'clean', false);
            this.inputsActions((input) => input.value = '');
            this.getValues();
            this.saveValuesToStorage();
            this.messege(t('success.clean'), this.messegeActions.SUCCESS);
        }, 150);
    }

    getValues() {
        this.inputsActions((input, dataValue, dataIndex) => {
            if (!this.values[dataValue]) this.values[dataValue] = {};

            const key = this.optionKeys[dataIndex];
            this.values[dataValue][key] = input.value || '';
        });
    }

    getRandomOptionKey() {
        const randomIndex = Math.floor(Math.random() * this.optionKeys.length);
        return this.optionKeys[randomIndex];
    }

    addInput(i, key) {
        let html = '';

        Object.entries(this.config.options).map((value, index) => {
            html += `<input data-value="${key}" id="${i}${index}" data-index="${index}" class="mash-game-box-input" type="text" placeholder="${value[1].text}" required/>`;
        })

        return html;
    }

    addBox() {
        let html = '';

        Object.entries(this.config.attributes).map((value, index) => {
            html += `
            <div class="mash-game-box-wrapper">
                <div class="mash-game-box-item">
                    <h2 class="mash-game-box-header">${value[1].text}</h2>
                    <ul>
                        <li clss="mash-game-box-li">
                            ${this.addInput(index, value[0])}
                        </li>
                    </ul>
                </div>
            </div>
            `;
        });

        return html;
    }

    result() {
        Object.entries(this.values).forEach((value, index) => {
            this.resultData[value[0]] = this.getRandomOptionKey();
        });

        const messegData = Object.keys(this.values).reduce((acc, key) => {
            acc[key] = this.values[key][this.resultData[key]] || 'unknown';
            return acc;
        }, {});

        this.messege(t('mashInfo', messegData), this.messegeActions.SUCCESS, false, false);
    }
}

function ready () {
    customElements.define('game-mash', Mash);
}

document.addEventListener("DOMContentLoaded", ready);