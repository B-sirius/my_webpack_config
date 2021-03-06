'use strict';

import 'font-awesome-webpack';
import './style.scss';

import Clipboard from 'clipboard';
import {
    fixed,
    throttleV2
} from './common.js';
import {
    hsl2hsv,
    hsl2rgb,
    hsv2hsl,
    hsv2rgb,
    rgb2hsl,
    rgb2hsv,
} from './colorConvert.js';

// 数字选择器构造器，传入的分别是选择器的种类，初始值，最低值，最高值，精度，上按钮dom，下按钮dom，输入框dom，触发器的快/慢触发时间，速度切换时间(ms)
let Selector = function (type, defaultVal, min, max, precision, input, upBtn, downBtn, normalSpeed, fastSpeed, swichTime) {
    this.type = type;
    this.val = defaultVal;
    this.min = min;
    this.max = max;
    this.precision = precision;
    this.input = input;
    this.upBtn = upBtn;
    this.downBtn = downBtn;
    this.normalSpeed = normalSpeed || 800;
    this.fastSpeed = fastSpeed || 50;
    this.swichTime = swichTime || 4000;
    this.input.self = this;
    this.input.value = this.val;
    this.upBtn.self = this;
    this.downBtn.self = this;
    this.fastId = null;
    this.slowId = null;
    this.timerId = null;
}

Selector.prototype.addEventListener = function () {
    let self = this;

    this.input.onkeydown = ((e) => {
        this.enter(e);
    });
    this.input.onkeyup = (() => {
        this.afterEnter(() => {
            if (this.type === 'rgb') {
                panelSelector.pickByRGB();
            } else if (this.type = 'hsl') {
                panelSelector.pickByHSL();
            } else {
                throw '类型未定义';
            }
        })
    });

    this.upBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();

        this.up(() => {
            if (this.type === 'rgb') {
                panelSelector.pickByRGB();
            } else if (this.type === 'hsl') {
                panelSelector.pickByHSL();
            } else {
                throw '类型未定义';
            }
        });

        this.normalId = setInterval(() => {
            this.up(() => {
                if (this.type === 'rgb') {
                    panelSelector.pickByRGB();
                } else if (this.type === 'hsl') {
                    panelSelector.pickByHSL();
                } else {
                    throw '类型未定义';
                }
            });
        }, this.normalSpeed);

        this.timer = setTimeout(() => {
            clearInterval(this.normalId);
            this.normalId = null;

            this.fastId = setInterval(() => {
                this.up(() => {
                    if (this.type === 'rgb') {
                        panelSelector.pickByRGB();
                    } else if (this.type === 'hsl') {
                        panelSelector.pickByHSL();
                    } else {
                        throw '类型未定义';
                    }
                });
            }, this.fastSpeed);
        }, this.swichTime);
    });

    this.upBtn.addEventListener('mouseup', (e) => {
        this.removeEventListener();
    });

    this.upBtn.addEventListener('mouseout', (e) => {
        this.removeEventListener();
    });

    this.downBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();

        this.down(() => {
            if (this.type === 'rgb') {
                panelSelector.pickByRGB();
            } else if (this.type === 'hsl') {
                panelSelector.pickByHSL();
            } else {
                throw '类型未定义';
            }
        });

        this.normalId = setInterval(() => {
            this.down(() => {
                if (this.type === 'rgb') {
                    panelSelector.pickByRGB();
                } else if (this.type === 'hsl') {
                    panelSelector.pickByHSL();
                } else {
                    throw '类型未定义';
                }
            });
        }, this.normalSpeed);

        this.timer = setTimeout(() => {
            clearInterval(this.normalId);
            this.normalId = null;
            this.fastId = setInterval(() => {
                this.down(() => {
                    if (this.type === 'rgb') {
                        panelSelector.pickByRGB();
                    } else if (this.type === 'hsl') {
                        panelSelector.pickByHSL();
                    } else {
                        throw '类型未定义';
                    }
                });
            }, this.fastSpeed);
        }, this.swichTime);
    });

    this.downBtn.addEventListener('mouseup', () => {
        this.removeEventListener();
    });

    this.downBtn.addEventListener('mouseout', () => {
        this.removeEventListener();
    });
}

Selector.prototype.removeEventListener = function () {
    if (this.normalId !== null) {
        clearInterval(this.normalId);
        this.normalId = null;
    } else if (this.fastId !== null) {
        clearInterval(this.fastId);
        this.fastId = null;
    }

    if (this.timer !== null) {
        clearTimeout(this.timer);
        this.timer = null;
    }
}

Selector.prototype.isLegal = function (newVal) { // 合法性检查
    if ((newVal / this.precision) % 1 === 0) { // 如果是整数
        if (newVal >= this.min && newVal <= this.max) {
            return true;
        }
    }
    return false;
}

Selector.prototype.setVal = function (newVal) { // 被动改变值
    this.val = newVal;
    this.input.value = this.val;
}

Selector.prototype.enter = function (e) {
    let key = e.key;
    if (isNaN(parseFloat(key)) && key !== 'Backspace' && key !== '.') { // 如果不是数字键且不是退格且不是小数点
        return;
    }
}

Selector.prototype.afterEnter = function (callback) {
    if (this.input.value === '') {
        this.input.value = 0;
    }
    let newVal = parseFloat(this.input.value);
    if (!this.isLegal(newVal)) {
        this.input.value = this.val;
        return;
    }
    this.val = newVal;

    let fn = callback || function () {};
    fn();
}

Selector.prototype.up = function (callback) {
    this.val = fixed(this.val + this.precision, 2);
    if (this.val > this.max) {
        this.val = this.max;
    }
    this.input.value = this.val;

    let fn = callback || function () {};
    fn(this);
}

Selector.prototype.down = function (callback) {
    this.val = fixed(this.val - this.precision, 2);
    if (this.val < this.min) {
        this.val = this.min;
    }
    this.input.value = this.val;

    let fn = callback || function () {};
    fn(this);
}

// 数字选择器实例
let selectors = (function () {
    let t = {
        rgb: {},
        hsl: {}
    }; // 用于最后返回

    let rgbSelectorElements = document.getElementById('rgbWrapper').getElementsByClassName('selector-wrapper');

    let hslSelectorElements = document.getElementById('hslWrapper').getElementsByClassName('selector-wrapper');

    for (let selector of rgbSelectorElements) { // 初始化rgb选择器
        let type = selector.getElementsByClassName('text')[0].innerHTML;
        let input = selector.getElementsByClassName('selector')[0];
        let upBtn = selector.getElementsByClassName('up')[0];
        let downBtn = selector.getElementsByClassName('down')[0];

        if (type === 'R') {
            t.rgb[type] = new Selector('rgb', 255, 0, 255, 1, input, upBtn, downBtn);
        } else {
            t.rgb[type] = new Selector('rgb', 0, 0, 255, 1, input, upBtn, downBtn);
        }

        t.rgb[type].addEventListener(); // 事件监听
    }

    for (let selector of hslSelectorElements) { // 初始化hsl选择器
        let type = selector.getElementsByClassName('text')[0].innerHTML;
        let input = selector.getElementsByClassName('selector')[0];
        let upBtn = selector.getElementsByClassName('up')[0];
        let downBtn = selector.getElementsByClassName('down')[0];

        if (type === 'H') {
            t.hsl[type] = new Selector('hsl', 360, 0, 360, 1, input, upBtn, downBtn);
        } else if (type === 'S') {
            t.hsl[type] = new Selector('hsl', 1, 0, 1, 0.01, input, upBtn, downBtn);
        } else {
            t.hsl[type] = new Selector('hsl', 0.5, 0, 1, 0.01, input, upBtn, downBtn);
        }

        t.hsl[type].addEventListener(); // 事件监听
    }

    return t;
})();

// 条形选择器构造器，传入的分别是颜色初始值(hsv)数组，初始位置，最大位置，颜色条和按钮的dom
let BarSelector = function (defaultColor, defaultPos, maxpos, bar, btn) {
    this.color = defaultColor;
    this.btnPos = defaultPos;
    this.maxPos = maxpos;
    this.bar = bar;
    this.bar.self = this;
    this.btn = btn;
    this.btn.self = this;
}

BarSelector.prototype.pick = function () {
    let h = fixed((this.btnPos / this.maxPos) * 360);
    let s = 1;
    let v = 1;

    this.color = [h, s, v];

    let rgbArr = hsv2rgb(h, s, v); // 获得rgb颜色

    let color = `rgb(${rgbArr[0]}, ${rgbArr[1]}, ${rgbArr[2]})`;
    this.btn.style.background = color; // 设置按钮颜色

    colorPanel.render(color); // 渲染取色板
}

BarSelector.prototype.setPos = function (e) {
    this.btnPos = e.offsetY;
    this.btn.style.top = this.btnPos + 'px';

    this.pick();

    panelSelector.pick(); // 取色板取色

    panelSelector.setRgbVal();
    panelSelector.setHslVal();

    panelSelector.show();
}

BarSelector.prototype.move = function (e) {
    let oldPos = this.oldPos;

    let startPos = this.startPos;

    let distance = e.pageY - startPos;

    this.btnPos = oldPos + distance;

    if (this.btnPos < 0) {
        this.btnPos = 0;
    } else if (this.btnPos > this.maxPos) {
        this.btnPos = this.maxPos;
    }

    this.btn.style.top = this.btnPos + 'px';

    this.pick();

    panelSelector.pick(); // 取色板取色

    panelSelector.setRgbVal();
    panelSelector.setHslVal();

    panelSelector.show();
}

// 条行选择器实例 
let barSelector = (function () {
    let defaultColor = [360, 1, 1]; // hsv

    let bar = document.getElementById('bar');
    let btn = document.getElementById('barBtn');

    bar.onclick = function (e) {
        bar.self.setPos(e);
    }

    let t = throttleV2(function (e) {
        btn.self.move(e);
    }, 15, 30); // 必须确保调用点的this指向是PanelSelector对象

    btn.addEventListener('mousedown', function (e) {
        e.preventDefault();

        btn.self.startPos = e.pageY;
        btn.self.oldPos = btn.self.btnPos;
        window.addEventListener('mousemove', t);
    });
    window.addEventListener('mouseup', function () {
        window.removeEventListener('mousemove', t);
    });

    return new BarSelector(defaultColor, 0, 400, bar, btn);
})();

// 面板选择器构造器，传入的是按钮实例
let PanelSelector = function (defaultX, defaultY, maxX, maxY, btn, canvas, pickedColorEl, value) {
    this.color = [];
    this.x = defaultX;
    this.y = defaultY;
    this.maxX = maxX;
    this.maxY = maxY;
    this.btn = btn;
    this.btn.self = this;
    this.panel = panel;
    this.panel.self = this;
    this.pickedColorEl = pickedColorEl;
    this.value = value;
}

PanelSelector.prototype.pickByRGB = function () { // 依据rgb值进行取色
    let r = selectors.rgb.R.val;
    let g = selectors.rgb.G.val;
    let b = selectors.rgb.B.val;

    let hsvArr = rgb2hsv(r, g, b);

    let h = hsvArr[0];
    let s = hsvArr[1];
    let v = hsvArr[2];

    this.x = s * this.maxX;
    this.y = this.maxY - v * this.maxY;
    this.btn.style.left = this.x + 'px';
    this.btn.style.top = this.y + 'px';

    barSelector.btnPos = fixed(barSelector.maxPos * (h / 360));
    barSelector.btn.style.top = barSelector.btnPos + 'px';

    barSelector.pick(); // 取色条取色

    this.pick(); // 取色板取色

    this.setHslVal();
}

PanelSelector.prototype.pickByHSL = function () { // 依据hsl值进行取色
    let h = selectors.hsl.H.val;
    let s = selectors.hsl.S.val;
    let l = selectors.hsl.L.val;

    let hsvArr = hsl2hsv(h, s, l);

    h = hsvArr[0];
    s = hsvArr[1];
    let v = hsvArr[2];

    this.x = s * this.maxX;
    this.y = this.maxY - v * this.maxY;
    this.btn.style.left = this.x + 'px';
    this.btn.style.top = this.y + 'px';

    barSelector.btnPos = fixed(barSelector.maxPos * (h / 360));
    barSelector.btn.style.top = barSelector.btnPos + 'px';

    barSelector.pick(); // 取色条取色

    this.pick(); // 取色板取色

    this.setRgbVal();

    this.show(); // 渲染展示面板
}

PanelSelector.prototype.pick = function () {
    let h = barSelector.color[0];
    let s = fixed(this.x / this.maxX, 2);
    let v = fixed(1 - this.y / this.maxY, 2);

    this.color = [h, s, v];

    let rgbArr = hsv2rgb(h, s, v);

    this.btn.style.background = `rgb(${rgbArr[0]}, ${rgbArr[1]}, ${rgbArr[2]})`;

    this.show();
}

PanelSelector.prototype.setPos = function (e) {
    this.x = e.offsetX;
    this.y = e.offsetY;
    this.btn.style.left = this.x + 'px';
    this.btn.style.top = this.y + 'px';

    this.pick();

    this.setRgbVal();
    this.setHslVal();

    this.show();
}

PanelSelector.prototype.setRgbVal = function () {
    let h = this.color[0];
    let s = this.color[1];
    let v = this.color[2];

    let rgbArr = hsv2rgb(h, s, v);

    selectors.rgb.R.setVal(rgbArr[0]);
    selectors.rgb.G.setVal(rgbArr[1]);
    selectors.rgb.B.setVal(rgbArr[2]);
}

PanelSelector.prototype.setHslVal = function () {
    let h = this.color[0];
    let s = this.color[1];
    let v = this.color[2];

    let hslArr = hsv2hsl(h, s, v);

    selectors.hsl.H.setVal(hslArr[0]);
    selectors.hsl.S.setVal(hslArr[1]);
    selectors.hsl.L.setVal(hslArr[2]);
}

PanelSelector.prototype.show = function () {
    let rgb = [selectors.rgb.R.val, selectors.rgb.G.val, selectors.rgb.B.val];
    let hsl = [selectors.hsl.H.val, selectors.hsl.S.val, selectors.hsl.L.val];
    let hsv = this.color;

    this.pickedColorEl.style.background = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

    let rgbText = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    let hslText = `hsl(${hsl[0]}, ${hsl[1]}, ${hsl[2]})`;
    let hsvText = `hsv(${hsv[0]}, ${hsv[1]}, ${hsv[2]})`;


    this.value.rgb.innerHTML = rgbText;
    this.value.hsl.innerHTML = hslText;
    this.value.hsv.innerHTML = hsvText;
}

PanelSelector.prototype.move = function (e) {
    let oldX = this.oldPos.x,
        oldY = this.oldPos.y;

    let startX = this.startPos.x,
        startY = this.startPos.y;

    let distanceX = e.pageX - startX,
        distanceY = e.pageY - startY;

    this.x = oldX + distanceX;
    this.y = oldY + distanceY;

    if (this.x < 0) {
        this.x = 0;
    } else if (this.x > this.maxX) {
        this.x = this.maxX;
    }
    if (this.y < 0) {
        this.y = 0;
    } else if (this.y > this.maxY) {
        this.y = this.maxY;
    }

    this.btn.style.left = this.x + 'px';
    this.btn.style.top = this.y + 'px';

    this.pick();

    this.setRgbVal();
    this.setHslVal();

    this.show();
}

let panelSelector = (function () {
    let btn = document.getElementById('panelBtn');

    let panel = document.getElementById('panel');

    let pickedColorEl = document.getElementById('pickedColor');

    let rgb = document.getElementById('rgb');
    let hsl = document.getElementById('hsl');
    let hsv = document.getElementById('hsv');

    let value = {
        rgb,
        hsl,
        hsv
    };

    // 事件绑定
    panel.onclick = function (e) {
        panel.self.setPos(e);
    }

    let t = throttleV2(function (e) {
        btn.self.move(e);
    }, 15, 30); // 必须确保调用点的this指向是PanelSelector对象

    btn.addEventListener('mousedown', function (e) {
        e.preventDefault();
        btn.self.startPos = {
            x: e.pageX,
            y: e.pageY
        }
        btn.self.oldPos = {
            x: btn.self.x,
            y: btn.self.y
        }
        window.addEventListener('mousemove', t);
    });
    window.addEventListener('mouseup', function () {
        window.removeEventListener('mousemove', t);
    });

    return new PanelSelector(400, 0, 400, 400, btn, panel, pickedColorEl, value);
})();

// 鼠标点击后获得的颜色都是以hsv来计算，然后转换成rgb和hsl
let colorPanel = (function () {
    let canvas = document.getElementById('panel');
    let ctx = canvas.getContext('2d');

    let lightGradient = ctx.createLinearGradient(0, 0, 0, 400); // 亮度渲染

    lightGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    lightGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');

    return {
        render: function (color) { // 需要渲染两次
            ctx.clearRect(0, 0, 400, 400) // 清除画布

            let colorGradient = ctx.createLinearGradient(0, 0, 400, 0); // 颜色渲染

            colorGradient.addColorStop(0, 'rgb(255, 255, 255)');
            colorGradient.addColorStop(1, color);

            ctx.fillStyle = colorGradient;
            ctx.fillRect(0, 0, 400, 400);

            ctx.fillStyle = lightGradient;
            ctx.fillRect(0, 0, 400, 400);
        }
    }
})();

let init = (() => {
    new Clipboard('#rgbBtn');
    new Clipboard('#hslBtn');
    new Clipboard('#hsvBtn');

    barSelector.pick();
    panelSelector.pick();
})();