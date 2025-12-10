import React, { useState, useMemo, useCallback, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ReferenceLine, ReferenceDot } from 'recharts';
import { MapPin, Building2, TrendingUp, BarChart3, Users, ChevronDown, Calendar, Plus, X, Check, Home, School, ShoppingBag, Stethoscope, Bus, Upload, FileSpreadsheet, ChevronRight, Table, Download, Car } from 'lucide-react';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Данные конкурентов из примера
const initialCompetitors = [
  {
    id: 1,
    name: 'Мир (ГК "Оникс")',
    selected: true,
    priceRealization: 149590,
    priceList: 152879,
    salesRate: 14,
    housingClass: 'Комфорт',
    wallMaterial: 'Монолит-кирпич',
    finishing: 'Предчистовая',
    parkingCost: null,
    deliveryDate: '1 кв. 2028',
    readiness: 33,
    distanceToStop: 300,
    transport: { buses: 0, trolleys: 0, trams: 2, metro: 0 },
    infrastructure: { schools: 0, kindergartens: 0, malls: 1, clinics: 0 },
    reputation: '+',
    viewCharacteristics: { gsk: true, industrial: false, railway: false, sea: false, panorama: false, river: false, forest: false, cemetery: false },
    apartmentType: 'Евро',
    prices: { studio: [153, 182], one: [142, 174], two: [129, 169], three: [130, 144] }
  },
  {
    id: 2,
    name: 'Сезоны (ГК "ПМД")',
    selected: true,
    priceRealization: 148710,
    priceList: 148710,
    salesRate: 5,
    housingClass: 'Комфорт',
    wallMaterial: 'Монолит-кирпич',
    finishing: 'Чистовая',
    parkingCost: null,
    deliveryDate: '3 кв. 2029',
    readiness: 0,
    distanceToStop: 970,
    transport: { buses: 0, trolleys: 0, trams: 2, metro: 0 },
    infrastructure: { schools: 2, kindergartens: 0, malls: 1, clinics: 0 },
    reputation: '+',
    viewCharacteristics: { gsk: true, industrial: false, railway: false, sea: false, panorama: false, river: false, forest: false, cemetery: false },
    apartmentType: 'Евро',
    prices: { studio: [null, null], one: [null, null], two: [null, null], three: [null, null] }
  },
  {
    id: 3,
    name: 'Ракета-Дом Беляева',
    selected: true,
    priceRealization: 168000,
    priceList: 183279,
    salesRate: 3,
    housingClass: 'Комфорт+',
    wallMaterial: 'Монолит-кирпич',
    finishing: 'Черновая',
    parkingCost: 750000,
    deliveryDate: '1 кв. 2027',
    readiness: 40,
    distanceToStop: 620,
    transport: { buses: 2, trolleys: 0, trams: 0, metro: 0 },
    infrastructure: { schools: 0, kindergartens: 4, malls: 1, clinics: 0 },
    reputation: '-',
    viewCharacteristics: { gsk: false, industrial: false, railway: false, sea: false, panorama: false, river: false, forest: false, cemetery: false },
    apartmentType: 'Евро',
    prices: { studio: [186, 224], one: [174, 182], two: [null, null], three: [165, 169] }
  },
  {
    id: 4,
    name: 'Архитектор (Канта Групп)',
    selected: true,
    priceRealization: 147220,
    priceList: 168571,
    salesRate: 3,
    housingClass: 'Комфорт',
    wallMaterial: 'Монолит-кирпич',
    finishing: 'Предчистовая',
    parkingCost: null,
    deliveryDate: '1 кв. 2026',
    readiness: 60,
    distanceToStop: 223,
    transport: { buses: 5, trolleys: 0, trams: 0, metro: 0 },
    infrastructure: { schools: 1, kindergartens: 3, malls: 0, clinics: 0 },
    reputation: '-',
    viewCharacteristics: { gsk: true, industrial: true, railway: false, sea: false, panorama: false, river: false, forest: false, cemetery: false },
    apartmentType: 'Евро',
    prices: { studio: [179, 181], one: [169, 171], two: [164, null], three: [153, 163] }
  },
  {
    id: 5,
    name: 'Свобода (ГК "ПМД")',
    selected: true,
    priceRealization: 148530,
    priceList: 156321,
    salesRate: 11,
    housingClass: 'Комфорт',
    wallMaterial: 'Монолит-кирпич',
    finishing: 'Чистовая',
    parkingCost: null,
    deliveryDate: '4 кв. 2026',
    readiness: 40,
    distanceToStop: 490,
    transport: { buses: 1, trolleys: 0, trams: 0, metro: 0 },
    infrastructure: { schools: 0, kindergartens: 0, malls: 1, clinics: 0 },
    reputation: '+',
    viewCharacteristics: { gsk: true, industrial: false, railway: false, sea: false, panorama: false, river: false, forest: false, cemetery: false },
    apartmentType: 'Евро',
    prices: { studio: [null, null], one: [148, 177], two: [142, 170], three: [140, 162] }
  }
];

// Демо данные для эластичности
const elasticityData = [
  { price: 120000, sales: 18 },
  { price: 130000, sales: 15 },
  { price: 140000, sales: 12 },
  { price: 150000, sales: 9 },
  { price: 160000, sales: 7 },
  { price: 170000, sales: 5 },
  { price: 180000, sales: 3 },
];

// Компонент выпадающего списка
const Dropdown = ({ label, value, options, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className={`relative ${className}`}>
      <label className="block text-xs text-emerald-200 mb-1 font-medium">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 bg-emerald-900/50 border border-emerald-700 rounded-lg text-white text-left flex items-center justify-between hover:border-emerald-500 transition-colors text-sm"
      >
        <span>{value || 'Выберите...'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-emerald-900 border border-emerald-700 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => { onChange(option); setIsOpen(false); }}
              className={`w-full px-3 py-2 text-left hover:bg-emerald-800 transition-colors text-sm ${value === option ? 'bg-emerald-700 text-white' : 'text-emerald-100'}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Компонент поля ввода
const InputField = ({ label, value, onChange, type = 'text', suffix = '', placeholder = '' }) => (
  <div>
    <label className="block text-xs text-emerald-200 mb-1 font-medium">{label}</label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-emerald-900/50 border border-emerald-700 rounded-lg text-white placeholder-emerald-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-colors text-sm"
      />
      {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 text-sm">{suffix}</span>}
    </div>
  </div>
);

// Компонент для ввода цены с разделителями разрядов
const PriceInput = ({ value, onChange }) => {
  const [displayValue, setDisplayValue] = useState(value ? value.toLocaleString('ru-RU') : '');
  const [isFocused, setIsFocused] = useState(false);

  // Форматирование числа с пробелами
  const formatNumber = (num) => {
    if (!num && num !== 0) return '';
    return num.toLocaleString('ru-RU');
  };

  // Парсинг строки в число (убираем пробелы)
  const parseNumber = (str) => {
    const cleaned = str.replace(/\s/g, '').replace(/[^\d]/g, '');
    return parseInt(cleaned) || 0;
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;
    // Разрешаем ввод цифр и пробелов
    const cleaned = inputValue.replace(/[^\d\s]/g, '');
    setDisplayValue(cleaned);
    onChange(parseNumber(cleaned));
  };

  const handleFocus = () => {
    setIsFocused(true);
    // При фокусе показываем число без форматирования для удобства редактирования
    setDisplayValue(value ? value.toString() : '');
  };

  const handleBlur = () => {
    setIsFocused(false);
    // При потере фокуса форматируем число
    setDisplayValue(formatNumber(value));
  };

  // Синхронизация при изменении value извне
  React.useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatNumber(value));
    }
  }, [value, isFocused]);

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className="w-28 px-2 py-1.5 bg-emerald-900/50 border border-emerald-700 rounded text-white text-right font-mono text-sm focus:outline-none focus:border-emerald-500"
    />
  );
};

// Компонент квартального календаря
const QuarterPicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4];
  const quarters = ['1 кв.', '2 кв.', '3 кв.', '4 кв.'];

  return (
    <div className="relative">
      <label className="block text-xs text-emerald-200 mb-1 font-medium">Срок сдачи</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-emerald-900/50 border border-emerald-700 rounded-lg text-white text-left flex items-center justify-between hover:border-emerald-500 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          {value || 'Выберите квартал'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-emerald-900 border border-emerald-700 rounded-lg shadow-xl p-3">
          {years.map((year) => (
            <div key={year} className="mb-2">
              <div className="text-emerald-300 text-xs font-semibold mb-1">{year}</div>
              <div className="grid grid-cols-4 gap-1">
                {quarters.map((q) => (
                  <button
                    key={`${q} ${year}`}
                    onClick={() => { onChange(`${q} ${year}`); setIsOpen(false); }}
                    className={`px-2 py-1 text-xs rounded transition-colors ${value === `${q} ${year}` ? 'bg-emerald-500 text-white' : 'bg-emerald-800 text-emerald-200 hover:bg-emerald-700'}`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Компонент выбора конкурентов
const CompetitorSelector = ({ competitors, onToggle }) => (
  <div className="bg-emerald-900/30 rounded-xl p-4 border border-emerald-800">
    <h3 className="text-emerald-100 font-semibold mb-3 flex items-center gap-2">
      <Users className="w-4 h-4" /> Конкуренты в локации
    </h3>
    <div className="space-y-2">
      {competitors.map((comp) => (
        <label
          key={comp.id}
          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${comp.selected ? 'bg-emerald-800/50' : 'bg-emerald-900/30 hover:bg-emerald-800/30'}`}
        >
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${comp.selected ? 'bg-emerald-500 border-emerald-500' : 'border-emerald-600'}`}
            onClick={() => onToggle(comp.id)}
          >
            {comp.selected && <Check className="w-3 h-3 text-white" />}
          </div>
          <div className="flex-1">
            <div className="text-white text-sm font-medium">{comp.name}</div>
            <div className="text-emerald-400 text-xs">{comp.housingClass} • {comp.finishing} • {comp.salesRate} кв/мес</div>
          </div>
          <div className="text-right">
            <div className="text-emerald-300 text-sm font-mono">{comp.priceRealization.toLocaleString()} ₽</div>
            <div className="text-emerald-500 text-xs">реализ.</div>
          </div>
        </label>
      ))}
    </div>
  </div>
);

// Компонент выбора даты
const DatePicker = ({ value, onChange, label }) => {
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU');
  };

  return (
    <div className="relative">
      {label && <div className="text-emerald-300 text-sm mb-1">{label}</div>}
      <div className="relative">
        <input
          type="date"
          value={formatDateForInput(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-emerald-900/50 border border-emerald-700 rounded-lg text-white focus:border-emerald-400 focus:outline-none cursor-pointer appearance-none"
          style={{ colorScheme: 'dark' }}
        />
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none" />
      </div>
    </div>
  );
};

// Вкладка "Общая информация"
const GeneralInfoTab = ({ data, setData, competitors, setCompetitors }) => {
  const selectedCompetitors = competitors.filter(c => c.selected);
  const avgPrice = selectedCompetitors.length > 0
    ? Math.round(selectedCompetitors.reduce((sum, c) => sum + c.priceRealization, 0) / selectedCompetitors.length)
    : 0;
  const avgSalesRate = selectedCompetitors.length > 0
    ? (selectedCompetitors.reduce((sum, c) => sum + c.salesRate, 0) / selectedCompetitors.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">Справка по земельному участку</h2>
          </div>
          <div className="mt-2 flex items-center gap-4">
            <select
              value={data.city || 'Пермь'}
              onChange={(e) => setData({...data, city: e.target.value})}
              className="bg-transparent text-emerald-400 text-lg font-medium border-b border-emerald-700 focus:border-emerald-400 focus:outline-none py-1 cursor-pointer"
            >
              <option value="Екатеринбург" className="bg-emerald-900">Екатеринбург</option>
              <option value="Казань" className="bg-emerald-900">Казань</option>
              <option value="Махачкала" className="bg-emerald-900">Махачкала</option>
              <option value="Пермь" className="bg-emerald-900">Пермь</option>
              <option value="Санкт-Петербург" className="bg-emerald-900">Санкт-Петербург</option>
              <option value="Тольятти" className="bg-emerald-900">Тольятти</option>
            </select>
            <input
              type="text"
              value={data.plotName || ''}
              onChange={(e) => setData({...data, plotName: e.target.value})}
              placeholder="Название участка"
              className="bg-transparent text-emerald-400 text-lg font-medium border-b border-emerald-700 focus:border-emerald-400 focus:outline-none w-48 py-1 placeholder-emerald-600"
            />
          </div>
        </div>
        <div className="text-right">
          <DatePicker
            label="Дата выполнения"
            value={data.executionDate || new Date().toISOString()}
            onChange={(date) => setData({...data, executionDate: date})}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Левая колонка - Характеристики ЗУ */}
        <div className="space-y-4">
          <div className="bg-emerald-900/30 rounded-xl p-4 border border-emerald-800">
            <h3 className="text-emerald-100 font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Характеристики земельного участка
            </h3>
            <div className="space-y-3">
              <InputField label="Площадь ЗУ" value={data.area} onChange={(v) => setData({...data, area: v})} suffix="га" placeholder="0.00" />
              <InputField label="Кадастровый номер" value={data.cadastralNumber} onChange={(v) => setData({...data, cadastralNumber: v})} placeholder="00:00:0000000:000" />
              <InputField label="Адрес" value={data.address} onChange={(v) => setData({...data, address: v})} placeholder="Город, улица" />
              <div>
                <label className="block text-xs text-emerald-200 mb-1 font-medium">Назначение по генплану</label>
                <textarea
                  value={data.genPlan}
                  onChange={(e) => setData({...data, genPlan: e.target.value})}
                  className="w-full px-3 py-2 bg-emerald-900/50 border border-emerald-700 rounded-lg text-white placeholder-emerald-500 focus:border-emerald-400 focus:outline-none resize-none h-20"
                  placeholder="Вид разрешённого использования"
                />
              </div>
            </div>
          </div>

          {/* Инфраструктура */}
          <div className="bg-emerald-900/30 rounded-xl p-4 border border-emerald-800">
            <h3 className="text-emerald-100 font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Социальная инфраструктура (1 км)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-emerald-950/50 rounded-lg p-2.5 border border-emerald-800">
                <School className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-white font-semibold">{data.socialInfra?.schools || 0}</span>
                <span className="text-emerald-300 text-xs">Школ/Гимн./Лицеев</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-950/50 rounded-lg p-2.5 border border-emerald-800">
                <Home className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-white font-semibold">{data.socialInfra?.kindergartens || 0}</span>
                <span className="text-emerald-300 text-xs">Детских садов</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-950/50 rounded-lg p-2.5 border border-emerald-800">
                <ShoppingBag className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className={`font-semibold ${data.socialInfra?.malls ? 'text-green-400' : 'text-red-400'}`}>
                  {data.socialInfra?.malls ? '+' : '-'}
                </span>
                <span className="text-emerald-300 text-xs">Торговые центры</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-950/50 rounded-lg p-2.5 border border-emerald-800">
                <Stethoscope className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className={`font-semibold ${data.socialInfra?.clinics ? 'text-green-400' : 'text-red-400'}`}>
                  {data.socialInfra?.clinics ? '+' : '-'}
                </span>
                <span className="text-emerald-300 text-xs">Поликлиники</span>
              </div>
            </div>
          </div>

          {/* Транспорт */}
          <div className="bg-emerald-900/30 rounded-xl p-4 border border-emerald-800">
            <h3 className="text-emerald-100 font-semibold mb-4 flex items-center gap-2">
              <Bus className="w-4 h-4" /> Транспортная доступность
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-emerald-950/50 rounded-lg p-2.5 border border-emerald-800">
                <span className="text-emerald-300 text-sm">Расстояние до остановки</span>
                <span className="text-white font-semibold">{data.distanceToStop || 0} м</span>
              </div>
              <div className="flex items-center justify-between bg-emerald-950/50 rounded-lg p-2.5 border border-emerald-800">
                <span className="text-emerald-300 text-sm">Автобусы/Троллейбусы</span>
                <span className="text-white font-semibold">{data.transport?.busTrolley || 0}</span>
              </div>
              <div className="flex items-center justify-between bg-emerald-950/50 rounded-lg p-2.5 border border-emerald-800">
                <span className="text-emerald-300 text-sm">Трамваи</span>
                <span className="text-white font-semibold">{data.transport?.tram || 0}</span>
              </div>
              <div className="flex items-center justify-between bg-emerald-950/50 rounded-lg p-2.5 border border-emerald-800">
                <span className="text-emerald-300 text-sm">Станции метро</span>
                <span className={`font-semibold ${data.transport?.metro ? 'text-green-400' : 'text-red-400'}`}>
                  {data.transport?.metro ? '+' : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Центральная колонка - Продукт */}
        <div className="space-y-4">
          <div className="bg-emerald-900/30 rounded-xl p-4 border border-emerald-800">
            <h3 className="text-emerald-100 font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Характеристики продукта
            </h3>
            <div className="space-y-3">
              {/* Нередактируемые поля - подтягиваются с корректировок */}
              <div>
                <label className="block text-xs text-emerald-200 mb-1 font-medium">Класс жилья</label>
                <div className="w-full px-3 py-2.5 bg-emerald-950/50 border border-emerald-800 rounded-lg text-emerald-300 text-sm">
                  {data.housingClass || 'Не задан'}
                </div>
              </div>
              <div>
                <label className="block text-xs text-emerald-200 mb-1 font-medium">Вид отделки</label>
                <div className="w-full px-3 py-2.5 bg-emerald-950/50 border border-emerald-800 rounded-lg text-emerald-300 text-sm">
                  {data.finishing || 'Не задана'}
                </div>
              </div>
              <div>
                <label className="block text-xs text-emerald-200 mb-1 font-medium">Материал стен</label>
                <div className="w-full px-3 py-2.5 bg-emerald-950/50 border border-emerald-800 rounded-lg text-emerald-300 text-sm">
                  {data.wallMaterial || 'Не задан'}
                </div>
              </div>
              <InputField label="Этажность" value={data.floors} onChange={(v) => setData({...data, floors: v})} placeholder="12 - 15" />
              <Dropdown 
                label="Продукт-аналог" 
                value={data.productAnalog} 
                options={[
                  'Art City', 'Q на Кулагина', 'Statum', 'UNO', 'U-point', 
                  'Аквамарин', 'Арт Премиум', 'Атмосфера', 'Беседа', 'Весна', 
                  'Весна-2', 'Гранд Берег', 'Лето', 'Уникум', 'Царево City', 
                  'Царево Village', 'Южный Бульвар дом 2', 'Южный Бульвар дом 16', 
                  'Уникум на Коммунистической', 'Парковый квартал 2.0', 'Небосклоны', 
                  'Причал', 'Риверсайд', 'Стадиум'
                ]} 
                onChange={(v) => setData({...data, productAnalog: v})} 
              />
            </div>
          </div>

          {/* Паркинг */}
          <div className="bg-emerald-900/30 rounded-xl p-4 border border-emerald-800">
            <h3 className="text-emerald-100 font-semibold mb-4 flex items-center gap-2">
              <Car className="w-4 h-4" /> Паркинг
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-emerald-200 mb-1 font-medium">Тип паркинга</label>
                <ParkingSelect
                  value={data.parkingTypes || {}}
                  onChange={(v) => setData({...data, parkingTypes: v})}
                />
              </div>
              
              {/* Поля стоимости в зависимости от выбранных типов */}
              {data.parkingTypes?.underground && (
                <div>
                  <label className="block text-xs text-emerald-200 mb-1 font-medium">Стоимость подземного паркинга (млн ₽)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={data.parkingCostUnderground || ''}
                    onChange={(e) => setData({...data, parkingCostUnderground: parseFloat(e.target.value) || 0})}
                    placeholder="1.5"
                    className="w-full px-3 py-2.5 bg-emerald-950/50 border border-emerald-700 rounded-lg text-white text-sm placeholder-emerald-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              )}
              {data.parkingTypes?.multilevel && (
                <div>
                  <label className="block text-xs text-emerald-200 mb-1 font-medium">Стоимость многоуровневого паркинга (млн ₽)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={data.parkingCostMultilevel || ''}
                    onChange={(e) => setData({...data, parkingCostMultilevel: parseFloat(e.target.value) || 0})}
                    placeholder="1.0"
                    className="w-full px-3 py-2.5 bg-emerald-950/50 border border-emerald-700 rounded-lg text-white text-sm placeholder-emerald-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Квартирография */}
          <div className="bg-emerald-900/30 rounded-xl p-4 border border-emerald-800">
            <h3 className="text-emerald-100 font-semibold mb-4 flex items-center justify-between">
              <span>Квартирография</span>
              {(() => {
                const total = (data.apartmentMix?.studio || 0) + (data.apartmentMix?.one || 0) + 
                  (data.apartmentMix?.onePlus || 0) + (data.apartmentMix?.two || 0) + 
                  (data.apartmentMix?.twoPlus || 0) + (data.apartmentMix?.three || 0) + 
                  (data.apartmentMix?.four || 0);
                const isInvalid = total !== 100;
                return (
                  <span className={`text-sm font-mono ${isInvalid ? 'text-red-400' : 'text-emerald-400'}`}>
                    Σ {total}%
                  </span>
                );
              })()}
            </h3>
            <div className="space-y-2">
              {[
                { key: 'studio', label: 'Студии', area: 'до 35 м²' },
                { key: 'one', label: '1-комн.', area: '35 – 44 м²' },
                { key: 'onePlus', label: '1+ комн.', area: '45 – 54 м²' },
                { key: 'two', label: '2-комн.', area: '48 – 56 м²' },
                { key: 'twoPlus', label: '2+ комн.', area: '64 – 80 м²' },
                { key: 'three', label: '3-комн.', area: '75 – 95 м²' },
                { key: 'four', label: '4-комн.', area: '95+ м²' }
              ].map((item) => {
                const total = (data.apartmentMix?.studio || 0) + (data.apartmentMix?.one || 0) + 
                  (data.apartmentMix?.onePlus || 0) + (data.apartmentMix?.two || 0) + 
                  (data.apartmentMix?.twoPlus || 0) + (data.apartmentMix?.three || 0) + 
                  (data.apartmentMix?.four || 0);
                const isInvalid = total !== 100;
                return (
                  <div key={item.key} className="flex items-center gap-2 text-sm">
                    <span className="text-emerald-300 w-20">{item.label}</span>
                    <span className="text-emerald-500 w-20 text-xs">{item.area}</span>
                    <input
                      type="number"
                      value={data.apartmentMix?.[item.key] || 0}
                      onChange={(e) => setData({...data, apartmentMix: {...data.apartmentMix, [item.key]: parseInt(e.target.value) || 0}})}
                      className={`w-14 px-2 py-1 bg-emerald-900/50 border rounded text-white text-center text-sm focus:outline-none ${
                        isInvalid ? 'border-red-500 focus:border-red-400' : 'border-emerald-700 focus:border-emerald-500'
                      }`}
                    />
                    <span className="text-emerald-400">%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Правая колонка - Конкуренты и результаты */}
        <div className="space-y-4">
          <CompetitorSelector 
            competitors={competitors} 
            onToggle={(id) => setCompetitors(competitors.map(c => c.id === id ? {...c, selected: !c.selected} : c))}
          />

          {/* Итоговые показатели */}
          <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-xl p-4 border border-emerald-600">
            <h3 className="text-emerald-100 font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Рекомендуемые показатели
            </h3>
            <div className="space-y-4">
              {(() => {
                // Расчет средневзвешенной цены
                const mix = data.apartmentMix || {};
                const prices = data.prices || {};
                const totalPercent = (mix.studio || 0) + (mix.one || 0) + (mix.onePlus || 0) + 
                  (mix.two || 0) + (mix.twoPlus || 0) + (mix.three || 0) + (mix.four || 0);
                
                let recommendedPrice = 0;
                if (totalPercent > 0) {
                  recommendedPrice = 
                    (prices.studio || 0) * (mix.studio || 0) / 100 +
                    (prices.one || 0) * (mix.one || 0) / 100 +
                    (prices.onePlus || 0) * (mix.onePlus || 0) / 100 +
                    (prices.two || 0) * (mix.two || 0) / 100 +
                    (prices.twoPlus || 0) * (mix.twoPlus || 0) / 100 +
                    (prices.three || 0) * (mix.three || 0) / 100 +
                    (prices.four || 0) * (mix.four || 0) / 100;
                }
                recommendedPrice = Math.round(recommendedPrice);
                
                return (
                  <>
                    <div>
                      <div className="text-emerald-300 text-xs mb-1">Рекомендуемая цена</div>
                      <div className="text-3xl font-bold text-white font-mono">
                        {recommendedPrice.toLocaleString()} <span className="text-lg text-emerald-400">₽/м²</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-900/50 rounded-lg p-2">
                        <div className="text-emerald-400 text-xs">Пессимистичный</div>
                        <div className="text-white font-semibold font-mono">{Math.round(recommendedPrice * 0.9).toLocaleString()} ₽</div>
                        <div className="text-red-400 text-xs">-10%</div>
                      </div>
                      <div className="bg-emerald-900/50 rounded-lg p-2">
                        <div className="text-emerald-400 text-xs">Оптимистичный</div>
                        <div className="text-white font-semibold font-mono">{Math.round(recommendedPrice * 1.1).toLocaleString()} ₽</div>
                        <div className="text-green-400 text-xs">+10%</div>
                      </div>
                    </div>
                  </>
                );
              })()}
              <div>
                <div className="text-emerald-300 text-xs mb-1">Темп продаж</div>
                <div className="text-xl font-bold text-white">до {avgSalesRate} <span className="text-sm text-emerald-400">кв/мес</span></div>
              </div>
            </div>
          </div>

          {/* Стоимость по типам */}
          <div className="bg-emerald-900/30 rounded-xl p-4 border border-emerald-800">
            <h3 className="text-emerald-100 font-semibold mb-3">Стоимость кв.м, руб/м²</h3>
            <div className="space-y-2 text-sm">
              {[
                { key: 'studio', label: 'Студии' },
                { key: 'one', label: '1-комн.' },
                { key: 'onePlus', label: '1+ комн.' },
                { key: 'two', label: '2-комн.' },
                { key: 'twoPlus', label: '2+ комн.' },
                { key: 'three', label: '3-комн.' },
                { key: 'four', label: '4-комн.' }
              ].map((item) => (
                <div key={item.key} className="flex justify-between items-center">
                  <span className="text-emerald-300">{item.label}</span>
                  <PriceInput
                    value={data.prices?.[item.key] || 0}
                    onChange={(v) => setData({...data, prices: {...data.prices, [item.key]: v}})}
                  />
                </div>
              ))}
              <div className="border-t border-emerald-700 pt-2 mt-2 flex justify-between font-semibold">
                <span className="text-emerald-200">Средневзвешенная</span>
                <span className="text-emerald-400 font-mono">
                  {(() => {
                    const mix = data.apartmentMix || {};
                    const prices = data.prices || {};
                    const totalPercent = (mix.studio || 0) + (mix.one || 0) + (mix.onePlus || 0) + 
                      (mix.two || 0) + (mix.twoPlus || 0) + (mix.three || 0) + (mix.four || 0);
                    if (totalPercent === 0) return '0';
                    const weightedSum = 
                      (prices.studio || 0) * (mix.studio || 0) / 100 +
                      (prices.one || 0) * (mix.one || 0) / 100 +
                      (prices.onePlus || 0) * (mix.onePlus || 0) / 100 +
                      (prices.two || 0) * (mix.two || 0) / 100 +
                      (prices.twoPlus || 0) * (mix.twoPlus || 0) / 100 +
                      (prices.three || 0) * (mix.three || 0) / 100 +
                      (prices.four || 0) * (mix.four || 0) / 100;
                    return Math.round(weightedSum).toLocaleString('ru-RU');
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Inline dropdown для таблицы (вынесен для предотвращения потери фокуса)
const InlineDropdown = ({ value, options, onChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (disabled) {
    return <span className="text-emerald-300">{value}</span>;
  }
  
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-white hover:text-emerald-300 transition-colors"
      >
        {value}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-50 left-0 mt-1 bg-emerald-900 border border-emerald-700 rounded-lg shadow-xl overflow-hidden min-w-[140px]">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => { onChange(option); setIsOpen(false); }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-emerald-800 transition-colors ${value === option ? 'bg-emerald-700 text-white' : 'text-emerald-100'}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Inline input для редактирования числовых значений (вынесен для предотвращения потери фокуса)
const InlineNumberInput = ({ value, onChange, disabled = false, min = 0 }) => {
  if (disabled) {
    return <span className="text-emerald-300">{value}</span>;
  }
  return (
    <input
      type="number"
      min={min}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value) || 0)}
      className="w-12 px-1 py-0.5 bg-emerald-900/50 border border-emerald-700 rounded text-white text-center text-sm focus:outline-none focus:border-emerald-500"
    />
  );
};

// Inline toggle для +/- (вынесен для предотвращения потери фокуса)
const InlineToggle = ({ value, onChange, disabled = false }) => {
  if (disabled) {
    return <span className="text-emerald-300">{value ? '+' : '-'}</span>;
  }
  return (
    <button
      onClick={() => onChange(!value)}
      className={`px-2 py-0.5 rounded text-sm font-semibold transition-colors ${
        value ? 'bg-green-700 text-green-100 hover:bg-green-600' : 'bg-red-900/50 text-red-300 hover:bg-red-800'
      }`}
    >
      {value ? '+' : '-'}
    </button>
  );
};

// Константы для типов паркинга
const PARKING_OPTIONS = [
  { key: 'underground', label: 'Подземный' },
  { key: 'multilevel', label: 'Многоуровневый' },
  { key: 'surface', label: 'Плоскостной' }
];

// Компонент мультиселекта для типов паркинга
const ParkingSelect = ({ value = {}, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedLabels = PARKING_OPTIONS
    .filter(opt => value[opt.key])
    .map(opt => opt.label);
  
  const displayText = selectedLabels.length > 0 ? selectedLabels.join(', ') : 'Выберите тип';
  
  const handleToggle = (key) => {
    onChange({ ...value, [key]: !value[key] });
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 bg-emerald-950/50 border border-emerald-700 rounded-lg text-white text-sm text-left hover:border-emerald-500 transition-colors flex items-center justify-between gap-2"
      >
        <span className="truncate flex-1">{displayText}</span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-emerald-900 border border-emerald-700 rounded-lg shadow-xl overflow-hidden">
          {PARKING_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleToggle(opt.key)}
              className="w-full px-3 py-2.5 text-left hover:bg-emerald-800 transition-colors text-sm flex items-center gap-2"
            >
              <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                value[opt.key] ? 'bg-emerald-500 border-emerald-500' : 'border-emerald-600'
              }`}>
                {value[opt.key] && <Check className="w-3 h-3 text-white" />}
              </span>
              <span className="text-emerald-100">{opt.label}</span>
            </button>
          ))}
          <div className="border-t border-emerald-700 p-2">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-1 text-xs text-emerald-400 hover:text-emerald-300"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Константы для видовых характеристик
const VIEW_CHARACTERISTICS_OPTIONS = [
  { key: 'sea', label: 'Море', correction: 10 },
  { key: 'panorama', label: 'Панорамный вид', correction: 10 },
  { key: 'river', label: 'Река/озеро', correction: 10 },
  { key: 'forest', label: 'Лес/парк/лесопарк', correction: 5 },
  { key: 'railway', label: 'Ж/Д', correction: -5 },
  { key: 'gsk', label: 'ГСК', correction: -5 },
  { key: 'industrial', label: 'Промзона/ЛЭП/Свалка', correction: -10 },
  { key: 'cemetery', label: 'Кладбище', correction: -10 }
];

// Компонент мультиселекта для видовых характеристик
const ViewCharacteristicsSelect = ({ value = {}, onChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Получаем список выбранных характеристик
  const selectedLabels = VIEW_CHARACTERISTICS_OPTIONS
    .filter(opt => value[opt.key])
    .map(opt => opt.label);
  
  const displayText = selectedLabels.length > 0 ? selectedLabels.join(', ') : '—';
  
  const handleToggle = (key) => {
    if (disabled) return;
    onChange({ ...value, [key]: !value[key] });
  };

  if (disabled) {
    return (
      <div className="text-emerald-300 text-xs text-left px-2 py-1 max-w-[150px]">
        {displayText}
      </div>
    );
  }
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="min-w-[140px] max-w-[200px] px-2 py-1 bg-emerald-900/50 border border-emerald-700 rounded text-white text-xs text-left hover:border-emerald-500 transition-colors flex items-center justify-between gap-1"
      >
        <span className="truncate flex-1">{displayText}</span>
        <ChevronDown className={`w-3 h-3 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-50 w-56 mt-1 bg-emerald-900 border border-emerald-700 rounded-lg shadow-xl overflow-hidden">
          {VIEW_CHARACTERISTICS_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleToggle(opt.key)}
              className="w-full px-3 py-2 text-left hover:bg-emerald-800 transition-colors text-sm flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                  value[opt.key] ? 'bg-emerald-500 border-emerald-500' : 'border-emerald-600'
                }`}>
                  {value[opt.key] && <Check className="w-3 h-3 text-white" />}
                </span>
                <span className="text-emerald-100">{opt.label}</span>
              </span>
              <span className={`text-xs font-mono ${opt.correction > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {opt.correction > 0 ? '+' : ''}{opt.correction}%
              </span>
            </button>
          ))}
          <div className="border-t border-emerald-700 p-2">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-1 text-xs text-emerald-400 hover:text-emerald-300"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Функция для отображения видовых характеристик в виде текста
const getViewCharacteristicsText = (viewChars = {}) => {
  const selected = VIEW_CHARACTERISTICS_OPTIONS
    .filter(opt => viewChars[opt.key])
    .map(opt => opt.label);
  return selected.length > 0 ? selected.join(', ') : '—';
};

// Вкладка корректировок
const CorrectionsTab = ({ competitors, setCompetitors, plotData, setPlotData, priceType = 'realization' }) => {
  const selectedCompetitors = competitors.filter(c => c.selected);
  const priceKey = priceType === 'realization' ? 'priceRealization' : 'priceList';
  const isEditable = priceType === 'realization' && setPlotData !== null;

  // Функция обновления данных конкурента
  const updateCompetitor = (competitorId, field, value) => {
    if (!setCompetitors) return;
    setCompetitors(competitors.map(c => 
      c.id === competitorId ? {...c, [field]: value} : c
    ));
  };

  // Получаем весовые коэффициенты из plotData или создаем новые
  const getWeights = () => {
    const savedWeights = plotData.competitorWeights || {};
    return selectedCompetitors.map((c, idx) => savedWeights[c.id] ?? (idx + 1));
  };

  const manualWeights = getWeights();

  // Функция обновления весов
  const updateWeight = (competitorId, weight) => {
    if (!setPlotData) return;
    const newWeights = { ...plotData.competitorWeights };
    newWeights[competitorId] = weight;
    setPlotData({ ...plotData, competitorWeights: newWeights });
  };

  // Проверка на дубликаты весов
  const hasDuplicateWeight = (weight) => {
    return manualWeights.filter(w => w === weight).length > 1;
  };

  // Расчет корректировок
  const calculateCorrections = (competitor) => {
    let price = competitor[priceKey];
    const corrections = [];

    // 1. Готовность объекта (наш объект всегда 0%)
    // Если готовность конкурента = 0%, цена не меняется
    // Иначе: Цена скорр. = Цена / (1 + Готовность * 10%)
    let priceAfterReadiness = price;
    let readinessCorr = 0;
    
    if (competitor.readiness > 0) {
      const readinessFactor = (competitor.readiness / 100) * 0.1; // Готовность * 10%
      priceAfterReadiness = price / (1 + readinessFactor);
      readinessCorr = ((priceAfterReadiness - price) / price) * 100; // Корректировка в %
    }
    
    corrections.push({ name: 'Готовность объекта', value: readinessCorr, price: priceAfterReadiness });

    // 2. Расстояние до остановки
    // Корректировка = (Расстояние конкурента - Расстояние нашего участка) / 200, в %
    const distanceCorr = ((competitor.distanceToStop || 0) - (plotData.distanceToStop || 0)) / 200;
    const priceAfterDistance = priceAfterReadiness * (1 + distanceCorr / 100);
    corrections.push({ name: 'Расстояние до остановки', value: distanceCorr, price: priceAfterDistance });

    // 3. Транспортная доступность
    const plotTransport = (plotData.transport?.busTrolley || 0) + (plotData.transport?.tram || 0) + (plotData.transport?.metro ? 2 : 0);
    const compTransport = (competitor.transport?.buses || 0) + (competitor.transport?.trolleys || 0) + (competitor.transport?.trams || 0) + (competitor.transport?.metro ? 2 : 0);
    let transportCorr = 0;
    if (compTransport > plotTransport + 2) transportCorr = -3;
    else if (plotTransport > compTransport + 2) transportCorr = 3;
    const priceAfterTransport = priceAfterDistance * (1 + transportCorr / 100);
    corrections.push({ name: 'Транспортная доступность', value: transportCorr, price: priceAfterTransport });

    // 4. Социальная инфраструктура
    let infraCorr = 0;
    const plotSchools = plotData.socialInfra?.schools || 0;
    const plotKindergartens = plotData.socialInfra?.kindergartens || 0;
    const plotMalls = plotData.socialInfra?.malls || false;
    const plotClinics = plotData.socialInfra?.clinics || false;
    
    if (competitor.infrastructure.schools > plotSchools) infraCorr -= 2;
    else if (competitor.infrastructure.schools < plotSchools) infraCorr += 2;
    if (competitor.infrastructure.kindergartens > plotKindergartens) infraCorr -= 2;
    else if (competitor.infrastructure.kindergartens < plotKindergartens) infraCorr += 2;
    if (competitor.infrastructure.malls > 0 && !plotMalls) infraCorr -= 1;
    else if (competitor.infrastructure.malls === 0 && plotMalls) infraCorr += 1;
    if (competitor.infrastructure.clinics > 0 && !plotClinics) infraCorr -= 1;
    else if (competitor.infrastructure.clinics === 0 && plotClinics) infraCorr += 1;
    
    const priceAfterInfra = priceAfterTransport * (1 + infraCorr / 100);
    corrections.push({ name: 'Социальная инфраструктура', value: infraCorr, price: priceAfterInfra });

    // 5. Материал стен
    let wallCorr = 0;
    const plotWall = plotData.wallMaterial || 'Монолит-кирпич';
    const compWall = competitor.wallMaterial;
    
    if (plotWall === 'Панель' && (compWall === 'Монолит-кирпич' || compWall === 'Кирпич')) {
      wallCorr = -10;
    } else if ((plotWall === 'Монолит-кирпич' || plotWall === 'Кирпич') && compWall === 'Панель') {
      wallCorr = 10;
    }
    
    const priceAfterWalls = priceAfterInfra * (1 + wallCorr / 100);
    corrections.push({ name: 'Материал стен', value: wallCorr, price: priceAfterWalls });

    // 6. Репутация застройщика
    let repCorr = 0;
    const plotRep = plotData.reputation || '-';
    const compRep = competitor.reputation;
    if (plotRep === '-' && compRep === '+') repCorr = -5;
    else if (plotRep === '+' && compRep === '-') repCorr = 5;
    const priceAfterRep = priceAfterWalls * (1 + repCorr / 100);
    corrections.push({ name: 'Репутация застройщика', value: repCorr, price: priceAfterRep });

    // 7. Отделка
    let finishCorr = 0;
    const finishingOrder = ['Черновая', 'Предчистовая', 'Чистовая'];
    const plotFinishIdx = finishingOrder.indexOf(plotData.finishing || 'Предчистовая');
    const compFinishIdx = finishingOrder.indexOf(competitor.finishing);
    if (compFinishIdx > plotFinishIdx) finishCorr = (compFinishIdx - plotFinishIdx) * -13;
    else if (compFinishIdx < plotFinishIdx) finishCorr = (plotFinishIdx - compFinishIdx) * 13;
    const priceAfterFinish = priceAfterRep * (1 + finishCorr / 100);
    corrections.push({ name: 'Отделка', value: finishCorr, price: priceAfterFinish });

    // 8. Класс жилья
    let classCorr = 0;
    const classOrder = ['Стандарт', 'Комфорт', 'Комфорт+', 'Бизнес', 'Элит'];
    const plotClassIdx = classOrder.indexOf(plotData.housingClass || 'Комфорт');
    const compClassIdx = classOrder.indexOf(competitor.housingClass);
    if (compClassIdx > plotClassIdx) classCorr = (compClassIdx - plotClassIdx) * -5;
    else if (compClassIdx < plotClassIdx) classCorr = (plotClassIdx - compClassIdx) * 5;
    const priceAfterClass = priceAfterFinish * (1 + classCorr / 100);
    corrections.push({ name: 'Класс жилья', value: classCorr, price: priceAfterClass });

    // 9. Видовые характеристики
    let viewCorr = 0;
    const plotView = plotData.viewCharacteristics || {};
    const compView = competitor.viewCharacteristics || {};
    
    // Проходим по всем характеристикам и считаем корректировку
    VIEW_CHARACTERISTICS_OPTIONS.forEach(opt => {
      const plotHas = plotView[opt.key] || false;
      const compHas = compView[opt.key] || false;
      
      if (plotHas && !compHas) {
        // У нас есть, у конкурента нет - применяем корректировку как есть
        viewCorr += opt.correction;
      } else if (!plotHas && compHas) {
        // У нас нет, у конкурента есть - применяем противоположную корректировку
        viewCorr -= opt.correction;
      }
      // Если оба имеют или оба не имеют - корректировка 0
    });
    
    // Ограничение корректировки видовых характеристик до ±15%
    viewCorr = Math.max(-15, Math.min(15, viewCorr));
    
    const priceAfterView = priceAfterClass * (1 + viewCorr / 100);
    corrections.push({ name: 'Видовые характеристики', value: viewCorr, price: priceAfterView });

    // 10. Характеристики квартир
    let aptCorr = 0;
    const aptOrder = ['Стандарт', 'Евро', 'Уникальное'];
    const plotAptIdx = aptOrder.indexOf(plotData.apartmentType || 'Евро');
    const compAptIdx = aptOrder.indexOf(competitor.apartmentType || 'Евро');
    if (compAptIdx > plotAptIdx) aptCorr = (compAptIdx - plotAptIdx) * -10;
    else if (compAptIdx < plotAptIdx) aptCorr = (plotAptIdx - compAptIdx) * 10;
    const priceAfterApt = priceAfterView * (1 + aptCorr / 100);
    corrections.push({ name: 'Характеристики квартир', value: aptCorr, price: priceAfterApt });

    return { corrections, finalPrice: priceAfterApt };
  };

  const correctionResults = selectedCompetitors.map(c => ({
    competitor: c,
    ...calculateCorrections(c)
  }));

  // Расчет весовых коэффициентов на основе рангов
  const totalWeightSum = manualWeights.reduce((a, b) => a + b, 0);
  const normalizedWeights = manualWeights.map(w => totalWeightSum > 0 ? w / totalWeightSum : 1 / manualWeights.length);

  // Базовая взвешенная цена
  const baseWeightedPrice = correctionResults.reduce((sum, r, idx) => sum + r.finalPrice * normalizedWeights[idx], 0);

  // Расчёт корректировки от факторов
  const getFactorsCorrection = () => {
    const factors = plotData.marketFactors || {};
    let correction = 0;
    
    // Конкуренция по ассортименту
    if (factors.competition === 'Низкая') correction += 5;
    else if (factors.competition === 'Высокая') correction -= 5;
    
    // Коммерческая стратегия
    if (factors.strategy === 'Продать быстро') correction -= 3;
    else if (factors.strategy === 'Продать дорого') correction += 3;
    
    // Рынок продаж и роста
    if (factors.marketGrowth === 'Да') correction += 3;
    else if (factors.marketGrowth === 'Нет') correction -= 3;
    
    return correction;
  };

  const factorsCorrection = getFactorsCorrection();
  const weightedPrice = baseWeightedPrice * (1 + factorsCorrection / 100);

  // Формирование данных для транспорта конкурента
  const getCompetitorTransportText = (comp) => {
    const parts = [];
    const busTotal = (comp.transport?.buses || 0) + (comp.transport?.trolleys || 0);
    if (busTotal > 0) parts.push(`Авт/Тр: ${busTotal}`);
    if (comp.transport?.trams > 0) parts.push(`Трам: ${comp.transport.trams}`);
    parts.push(`Метро: ${comp.transport?.metro ? '+' : '-'}`);
    return parts.join(', ');
  };

  // Формирование данных для инфраструктуры конкурента
  const getCompetitorInfraText = (comp) => {
    const parts = [];
    if (comp.infrastructure?.schools > 0) parts.push(`Шк: ${comp.infrastructure.schools}`);
    if (comp.infrastructure?.kindergartens > 0) parts.push(`ДС: ${comp.infrastructure.kindergartens}`);
    parts.push(`ТЦ: ${comp.infrastructure?.malls > 0 ? '+' : '-'}`);
    parts.push(`Пол: ${comp.infrastructure?.clinics > 0 ? '+' : '-'}`);
    return parts.join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Корректировки ({priceType === 'realization' ? 'Реализация' : 'Прайс'})
        </h2>
        <div className="bg-emerald-800 rounded-lg px-4 py-2">
          <span className="text-emerald-300 text-sm">Итоговая гипотеза: </span>
          <span className="text-white font-bold text-lg font-mono">{Math.round(weightedPrice).toLocaleString('ru-RU')} ₽/м²</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-emerald-900/50">
              <th className="text-left p-3 text-emerald-300 font-medium sticky left-0 bg-emerald-900/95 min-w-[200px]">Показатели</th>
              <th className="text-center p-3 text-emerald-200 font-medium min-w-[160px] bg-emerald-800/50">
                Оцениваемый участок
              </th>
              {selectedCompetitors.map((c) => (
                <th key={c.id} className="text-center p-3 text-emerald-200 font-medium min-w-[140px]">
                  {c.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {correctionResults.length > 0 && (
              <>
                {/* Средняя цена */}
                <tr className="border-b border-emerald-800/50 hover:bg-emerald-900/30">
                  <td className="p-3 text-emerald-300 sticky left-0 bg-emerald-950/95">{priceType === 'realization' ? 'Средняя цена реализации' : 'Средняя прайсовая цена'}</td>
                  <td className="p-3 text-center text-emerald-400 bg-emerald-800/30">—</td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center text-white font-mono">
                      {r.competitor[priceKey].toLocaleString('ru-RU')}
                    </td>
                  ))}
                </tr>

                {/* Дата сдачи */}
                <tr className="border-b border-emerald-800/50 hover:bg-emerald-900/30">
                  <td className="p-3 text-emerald-300 sticky left-0 bg-emerald-950/95">Дата сдачи</td>
                  <td className="p-3 text-center text-emerald-400 bg-emerald-800/30">{plotData.deliveryDate || '—'}</td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center text-white">{r.competitor.deliveryDate}</td>
                  ))}
                </tr>

                {/* Готовность объекта */}
                <tr className="border-b border-emerald-800/50 hover:bg-emerald-900/30 bg-emerald-800/20">
                  <td className="p-3 text-emerald-200 font-semibold sticky left-0 bg-emerald-900/95">Готовность объекта, %</td>
                  <td className="p-3 text-center text-emerald-400 bg-emerald-700/30">0%</td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center text-white">{r.competitor.readiness}%</td>
                  ))}
                </tr>
                <tr className="border-b border-emerald-800/50 bg-emerald-900/20">
                  <td className="p-3 text-emerald-400 text-xs sticky left-0 bg-emerald-950/95 pl-6">Корректировка</td>
                  <td className="p-3 text-center text-emerald-500 bg-emerald-800/30">—</td>
                  {correctionResults.map(r => {
                    const val = r.corrections[0].value;
                    return (
                      <td key={r.competitor.id} className={`p-3 text-center font-mono ${val > 0 ? 'text-green-400' : val < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {val > 0 ? '+' : ''}{val.toFixed(2)}%
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b border-emerald-800/50 bg-emerald-900/10">
                  <td className="p-3 text-emerald-200 text-xs sticky left-0 bg-emerald-950/95 pl-6">Скорр. цена</td>
                  <td className="p-3 text-center text-emerald-500 bg-emerald-800/30">—</td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center text-white font-mono">
                      {Math.round(r.corrections[0].price).toLocaleString('ru-RU')}
                    </td>
                  ))}
                </tr>

                {/* Расстояние до остановки */}
                <tr className="border-b border-emerald-800/50 hover:bg-emerald-900/30 bg-emerald-800/20">
                  <td className="p-3 text-emerald-200 font-semibold sticky left-0 bg-emerald-900/95">Расстояние до остановки, м</td>
                  <td className="p-3 text-center bg-emerald-700/30">
                    {isEditable ? (
                      <InlineNumberInput 
                        value={plotData.distanceToStop || 0} 
                        onChange={(v) => setPlotData({...plotData, distanceToStop: v})}
                      />
                    ) : (
                      <span className="text-emerald-300">{plotData.distanceToStop || 0}</span>
                    )}
                  </td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center text-white">{r.competitor.distanceToStop}</td>
                  ))}
                </tr>
                <tr className="border-b border-emerald-800/50 bg-emerald-900/20">
                  <td className="p-3 text-emerald-400 text-xs sticky left-0 bg-emerald-950/95 pl-6">Корректировка</td>
                  <td className="p-3 text-center text-emerald-500 bg-emerald-800/30">—</td>
                  {correctionResults.map(r => {
                    const val = r.corrections[1].value;
                    return (
                      <td key={r.competitor.id} className={`p-3 text-center font-mono ${val > 0 ? 'text-green-400' : val < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {val > 0 ? '+' : ''}{val.toFixed(2)}%
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b border-emerald-800/50 bg-emerald-900/10">
                  <td className="p-3 text-emerald-200 text-xs sticky left-0 bg-emerald-950/95 pl-6">Скорр. цена</td>
                  <td className="p-3 text-center text-emerald-500 bg-emerald-800/30">—</td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center text-white font-mono">
                      {Math.round(r.corrections[1].price).toLocaleString('ru-RU')}
                    </td>
                  ))}
                </tr>

                {/* Транспортная доступность */}
                <tr className="border-b border-emerald-800/50 hover:bg-emerald-900/30 bg-emerald-800/20">
                  <td className="p-3 text-emerald-200 font-semibold sticky left-0 bg-emerald-900/95">Транспортная доступность</td>
                  <td className="p-3 text-center bg-emerald-700/30"></td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center"></td>
                  ))}
                </tr>
                <tr className="border-b border-emerald-800/50 hover:bg-emerald-900/30">
                  <td className="p-3 text-emerald-300 sticky left-0 bg-emerald-950/95 pl-6">Автобусы/Троллейбусы</td>
                  <td className="p-3 text-center bg-emerald-800/30">
                    {isEditable ? (
                      <InlineNumberInput 
                        value={plotData.transport?.busTrolley || 0} 
                        onChange={(v) => setPlotData({...plotData, transport: {...plotData.transport, busTrolley: v}})}
                      />
                    ) : (
                      <span className="text-emerald-300">{plotData.transport?.busTrolley || 0}</span>
                    )}
                  </td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center text-white">
                      {(r.competitor.transport?.buses || 0) + (r.competitor.transport?.trolleys || 0)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-emerald-800/50 hover:bg-emerald-900/30">
                  <td className="p-3 text-emerald-300 sticky left-0 bg-emerald-950/95 pl-6">Трамваи</td>
                  <td className="p-3 text-center bg-emerald-800/30">
                    {isEditable ? (
                      <InlineNumberInput 
                        value={plotData.transport?.tram || 0} 
                        onChange={(v) => setPlotData({...plotData, transport: {...plotData.transport, tram: v}})}
                      />
                    ) : (
                      <span className="text-emerald-300">{plotData.transport?.tram || 0}</span>
                    )}
                  </td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center text-white">{r.competitor.transport?.trams || 0}</td>
                  ))}
                </tr>
                <tr className="border-b border-emerald-800/50 hover:bg-emerald-900/30">
                  <td className="p-3 text-emerald-300 sticky left-0 bg-emerald-950/95 pl-6">Станции метро</td>
                  <td className="p-3 text-center bg-emerald-800/30">
                    {isEditable ? (
                      <InlineToggle 
                        value={plotData.transport?.metro || false} 
                        onChange={(v) => setPlotData({...plotData, transport: {...plotData.transport, metro: v}})}
                      />
                    ) : (
                      <span className="text-emerald-300">{plotData.transport?.metro ? '+' : '-'}</span>
                    )}
                  </td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center text-white">{r.competitor.transport?.metro ? '+' : '-'}</td>
                  ))}
                </tr>
                <tr className="border-b border-emerald-800/50 bg-emerald-900/20">
                  <td className="p-3 text-emerald-400 text-xs sticky left-0 bg-emerald-950/95 pl-6">Корректировка</td>
                  <td className="p-3 text-center text-emerald-500 bg-emerald-800/30">—</td>
                  {correctionResults.map(r => {
                    const val = r.corrections[2].value;
                    return (
                      <td key={r.competitor.id} className={`p-3 text-center font-mono ${val > 0 ? 'text-green-400' : val < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {val > 0 ? '+' : ''}{val.toFixed(2)}%
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b border-emerald-800/50 bg-emerald-900/10">
                  <td className="p-3 text-emerald-200 text-xs sticky left-0 bg-emerald-950/95 pl-6">Скорр. цена</td>
                  <td className="p-3 text-center text-emerald-500 bg-emerald-800/30">—</td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center text-white font-mono">
                      {Math.round(r.corrections[2].price).toLocaleString('ru-RU')}
                    </td>
                  ))}
                </tr>

                {/* Социальная инфраструктура */}
                <tr className="border-b border-emerald-800/50 hover:bg-emerald-900/30 bg-emerald-800/20">
                  <td className="p-3 text-emerald-200 font-semibold sticky left-0 bg-emerald-900/95">Социальная инфраструктура</td>
                  <td className="p-3 text-center bg-emerald-700/30"></td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center"></td>
                  ))}
                </tr>
                <tr className="border-b border-emerald-800/50 hover:bg-emerald-900/30">
                  <td className="p-3 text-emerald-300 sticky left-0 bg-emerald-950/95 pl-6">Школы, Гимназии, Лицеи</td>
                  <td className="p-3 text-center bg-emerald-800/30">
                    {isEditable ? (
                      <InlineNumberInput 
                        value={plotData.socialInfra?.schools || 0} 
                        onChange={(v) => setPlotData({...plotData, socialInfra: {...plotData.socialInfra, schools: v}})}
                      />
                    ) : (
                      <span className="text-emerald-300">{plotData.socialInfra?.schools || 0}</span>
                    )}
                  </td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center text-white">{r.competitor.infrastructure?.schools || 0}</td>
                  ))}
                </tr>
                <tr className="border-b border-emerald-800/50 hover:bg-emerald-900/30">
                  <td className="p-3 text-emerald-300 sticky left-0 bg-emerald-950/95 pl-6">Детские сады</td>
                  <td className="p-3 text-center bg-emerald-800/30">
                    {isEditable ? (
                      <InlineNumberInput 
                        value={plotData.socialInfra?.kindergartens || 0} 
                        onChange={(v) => setPlotData({...plotData, socialInfra: {...plotData.socialInfra, kindergartens: v}})}
                      />
                    ) : (
                      <span className="text-emerald-300">{plotData.socialInfra?.kindergartens || 0}</span>
                    )}
                  </td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center text-white">{r.competitor.infrastructure?.kindergartens || 0}</td>
                  ))}
                </tr>
                <tr className="border-b border-emerald-800/50 hover:bg-emerald-900/30">
                  <td className="p-3 text-emerald-300 sticky left-0 bg-emerald-950/95 pl-6">Торговые центры</td>
                  <td className="p-3 text-center bg-emerald-800/30">
                    {isEditable ? (
                      <InlineToggle 
                        value={plotData.socialInfra?.malls || false} 
                        onChange={(v) => setPlotData({...plotData, socialInfra: {...plotData.socialInfra, malls: v}})}
                      />
                    ) : (
                      <span className="text-emerald-300">{plotData.socialInfra?.malls ? '+' : '-'}</span>
                    )}
                  </td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center text-white">{r.competitor.infrastructure?.malls > 0 ? '+' : '-'}</td>
                  ))}
                </tr>
                <tr className="border-b border-emerald-800/50 hover:bg-emerald-900/30">
                  <td className="p-3 text-emerald-300 sticky left-0 bg-emerald-950/95 pl-6">Поликлиники</td>
                  <td className="p-3 text-center bg-emerald-800/30">
                    {isEditable ? (
                      <InlineToggle 
                        value={plotData.socialInfra?.clinics || false} 
                        onChange={(v) => setPlotData({...plotData, socialInfra: {...plotData.socialInfra, clinics: v}})}
                      />
                    ) : (
                      <span className="text-emerald-300">{plotData.socialInfra?.clinics ? '+' : '-'}</span>
                    )}
                  </td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center text-white">{r.competitor.infrastructure?.clinics > 0 ? '+' : '-'}</td>
                  ))}
                </tr>
                <tr className="border-b border-emerald-800/50 bg-emerald-900/20">
                  <td className="p-3 text-emerald-400 text-xs sticky left-0 bg-emerald-950/95 pl-6">Корректировка</td>
                  <td className="p-3 text-center text-emerald-500 bg-emerald-800/30">—</td>
                  {correctionResults.map(r => {
                    const val = r.corrections[3].value;
                    return (
                      <td key={r.competitor.id} className={`p-3 text-center font-mono ${val > 0 ? 'text-green-400' : val < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {val > 0 ? '+' : ''}{val.toFixed(2)}%
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b border-emerald-800/50 bg-emerald-900/10">
                  <td className="p-3 text-emerald-200 text-xs sticky left-0 bg-emerald-950/95 pl-6">Скорр. цена</td>
                  <td className="p-3 text-center text-emerald-500 bg-emerald-800/30">—</td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center text-white font-mono">
                      {Math.round(r.corrections[3].price).toLocaleString('ru-RU')}
                    </td>
                  ))}
                </tr>

                {/* Материал стен */}
                <tr className="border-b border-emerald-800/50 hover:bg-emerald-900/30 bg-emerald-800/20">
                  <td className="p-3 text-emerald-200 font-semibold sticky left-0 bg-emerald-900/95">Материал стен</td>
                  <td className="p-3 text-center bg-emerald-700/30">
                    <InlineDropdown 
                      value={plotData.wallMaterial} 
                      options={['Панель', 'Кирпич', 'Монолит-кирпич']}
                      onChange={(v) => setPlotData({...plotData, wallMaterial: v})}
                      disabled={!isEditable}
                    />
                  </td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center text-white">{r.competitor.wallMaterial}</td>
                  ))}
                </tr>
                <tr className="border-b border-emerald-800/50 bg-emerald-900/20">
                  <td className="p-3 text-emerald-400 text-xs sticky left-0 bg-emerald-950/95 pl-6">Корректировка</td>
                  <td className="p-3 text-center text-emerald-500 bg-emerald-800/30">—</td>
                  {correctionResults.map(r => {
                    const val = r.corrections[4].value;
                    return (
                      <td key={r.competitor.id} className={`p-3 text-center font-mono ${val > 0 ? 'text-green-400' : val < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {val > 0 ? '+' : ''}{val.toFixed(2)}%
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b border-emerald-800/50 bg-emerald-900/10">
                  <td className="p-3 text-emerald-200 text-xs sticky left-0 bg-emerald-950/95 pl-6">Скорр. цена</td>
                  <td className="p-3 text-center text-emerald-500 bg-emerald-800/30">—</td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center text-white font-mono">
                      {Math.round(r.corrections[4].price).toLocaleString('ru-RU')}
                    </td>
                  ))}
                </tr>

                {/* Репутация застройщика */}
                <tr className="border-b border-emerald-800/50 hover:bg-emerald-900/30 bg-emerald-800/20">
                  <td className="p-3 text-emerald-200 font-semibold sticky left-0 bg-emerald-900/95">Репутация застройщика</td>
                  <td className="p-3 text-center bg-emerald-700/30">
                    {isEditable ? (
                      <InlineToggle 
                        value={plotData.reputation === '+'}
                        onChange={(v) => setPlotData({...plotData, reputation: v ? '+' : '-'})}
                      />
                    ) : (
                      <span className="text-emerald-300">{plotData.reputation || '-'}</span>
                    )}
                  </td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center">
                      {isEditable ? (
                        <InlineToggle 
                          value={r.competitor.reputation === '+'}
                          onChange={(v) => updateCompetitor(r.competitor.id, 'reputation', v ? '+' : '-')}
                        />
                      ) : (
                        <span className="text-white">{r.competitor.reputation}</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-emerald-800/50 bg-emerald-900/20">
                  <td className="p-3 text-emerald-400 text-xs sticky left-0 bg-emerald-950/95 pl-6">Корректировка</td>
                  <td className="p-3 text-center text-emerald-500 bg-emerald-800/30">—</td>
                  {correctionResults.map(r => {
                    const val = r.corrections[5].value;
                    return (
                      <td key={r.competitor.id} className={`p-3 text-center font-mono ${val > 0 ? 'text-green-400' : val < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {val > 0 ? '+' : ''}{val.toFixed(2)}%
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b border-emerald-800/50 bg-emerald-900/10">
                  <td className="p-3 text-emerald-200 text-xs sticky left-0 bg-emerald-950/95 pl-6">Скорр. цена</td>
                  <td className="p-3 text-center text-emerald-500 bg-emerald-800/30">—</td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center text-white font-mono">
                      {Math.round(r.corrections[5].price).toLocaleString('ru-RU')}
                    </td>
                  ))}
                </tr>

                {/* Отделка */}
                <tr className="border-b border-emerald-800/50 hover:bg-emerald-900/30 bg-emerald-800/20">
                  <td className="p-3 text-emerald-200 font-semibold sticky left-0 bg-emerald-900/95">Отделка</td>
                  <td className="p-3 text-center bg-emerald-700/30">
                    <InlineDropdown 
                      value={plotData.finishing} 
                      options={['Черновая', 'Предчистовая', 'Чистовая']}
                      onChange={(v) => setPlotData({...plotData, finishing: v})}
                      disabled={!isEditable}
                    />
                  </td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center text-white">{r.competitor.finishing}</td>
                  ))}
                </tr>
                <tr className="border-b border-emerald-800/50 bg-emerald-900/20">
                  <td className="p-3 text-emerald-400 text-xs sticky left-0 bg-emerald-950/95 pl-6">Корректировка</td>
                  <td className="p-3 text-center text-emerald-500 bg-emerald-800/30">—</td>
                  {correctionResults.map(r => {
                    const val = r.corrections[6].value;
                    return (
                      <td key={r.competitor.id} className={`p-3 text-center font-mono ${val > 0 ? 'text-green-400' : val < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {val > 0 ? '+' : ''}{val.toFixed(2)}%
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b border-emerald-800/50 bg-emerald-900/10">
                  <td className="p-3 text-emerald-200 text-xs sticky left-0 bg-emerald-950/95 pl-6">Скорр. цена</td>
                  <td className="p-3 text-center text-emerald-500 bg-emerald-800/30">—</td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center text-white font-mono">
                      {Math.round(r.corrections[6].price).toLocaleString('ru-RU')}
                    </td>
                  ))}
                </tr>

                {/* Класс жилья */}
                <tr className="border-b border-emerald-800/50 hover:bg-emerald-900/30 bg-emerald-800/20">
                  <td className="p-3 text-emerald-200 font-semibold sticky left-0 bg-emerald-900/95">Класс жилья</td>
                  <td className="p-3 text-center bg-emerald-700/30">
                    <InlineDropdown 
                      value={plotData.housingClass} 
                      options={['Стандарт', 'Комфорт', 'Комфорт+', 'Бизнес', 'Элит']}
                      onChange={(v) => setPlotData({...plotData, housingClass: v})}
                      disabled={!isEditable}
                    />
                  </td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center text-white">{r.competitor.housingClass}</td>
                  ))}
                </tr>
                <tr className="border-b border-emerald-800/50 bg-emerald-900/20">
                  <td className="p-3 text-emerald-400 text-xs sticky left-0 bg-emerald-950/95 pl-6">Корректировка</td>
                  <td className="p-3 text-center text-emerald-500 bg-emerald-800/30">—</td>
                  {correctionResults.map(r => {
                    const val = r.corrections[7].value;
                    return (
                      <td key={r.competitor.id} className={`p-3 text-center font-mono ${val > 0 ? 'text-green-400' : val < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {val > 0 ? '+' : ''}{val.toFixed(2)}%
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b border-emerald-800/50 bg-emerald-900/10">
                  <td className="p-3 text-emerald-200 text-xs sticky left-0 bg-emerald-950/95 pl-6">Скорр. цена</td>
                  <td className="p-3 text-center text-emerald-500 bg-emerald-800/30">—</td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center text-white font-mono">
                      {Math.round(r.corrections[7].price).toLocaleString('ru-RU')}
                    </td>
                  ))}
                </tr>

                {/* Видовые характеристики */}
                <tr className="border-b border-emerald-800/50 hover:bg-emerald-900/30 bg-emerald-800/20">
                  <td className="p-3 text-emerald-200 font-semibold sticky left-0 bg-emerald-900/95">Видовые характеристики</td>
                  <td className="p-3 text-center bg-emerald-700/30">
                    <ViewCharacteristicsSelect
                      value={plotData.viewCharacteristics || {}}
                      onChange={(v) => setPlotData({...plotData, viewCharacteristics: v})}
                      disabled={!isEditable}
                    />
                  </td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center text-white text-xs max-w-[150px]">
                      <ViewCharacteristicsSelect
                        value={r.competitor.viewCharacteristics || {}}
                        onChange={(v) => updateCompetitor(r.competitor.id, 'viewCharacteristics', v)}
                        disabled={!isEditable}
                      />
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-emerald-800/50 bg-emerald-900/20">
                  <td className="p-3 text-emerald-400 text-xs sticky left-0 bg-emerald-950/95 pl-6">Корректировка</td>
                  <td className="p-3 text-center text-emerald-500 bg-emerald-800/30">—</td>
                  {correctionResults.map(r => {
                    const val = r.corrections[8].value;
                    return (
                      <td key={r.competitor.id} className={`p-3 text-center font-mono ${val > 0 ? 'text-green-400' : val < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {val > 0 ? '+' : ''}{val.toFixed(2)}%
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b border-emerald-800/50 bg-emerald-900/10">
                  <td className="p-3 text-emerald-200 text-xs sticky left-0 bg-emerald-950/95 pl-6">Скорр. цена</td>
                  <td className="p-3 text-center text-emerald-500 bg-emerald-800/30">—</td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center text-white font-mono">
                      {Math.round(r.corrections[8].price).toLocaleString('ru-RU')}
                    </td>
                  ))}
                </tr>

                {/* Характеристики квартир */}
                <tr className="border-b border-emerald-800/50 hover:bg-emerald-900/30 bg-emerald-800/20">
                  <td className="p-3 text-emerald-200 font-semibold sticky left-0 bg-emerald-900/95">Характеристики квартир</td>
                  <td className="p-3 text-center bg-emerald-700/30">
                    <InlineDropdown 
                      value={plotData.apartmentType || 'Евро'} 
                      options={['Стандарт', 'Евро', 'Уникальное']}
                      onChange={(v) => setPlotData({...plotData, apartmentType: v})}
                      disabled={!isEditable}
                    />
                  </td>
                  {correctionResults.map(r => (
                    <td key={r.competitor.id} className="p-3 text-center">
                      <InlineDropdown 
                        value={r.competitor.apartmentType || 'Евро'} 
                        options={['Стандарт', 'Евро', 'Уникальное']}
                        onChange={(v) => updateCompetitor(r.competitor.id, 'apartmentType', v)}
                        disabled={!isEditable}
                      />
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-emerald-800/50 bg-emerald-900/20">
                  <td className="p-3 text-emerald-400 text-xs sticky left-0 bg-emerald-950/95 pl-6">Корректировка</td>
                  <td className="p-3 text-center text-emerald-500 bg-emerald-800/30">—</td>
                  {correctionResults.map(r => {
                    const val = r.corrections[9].value;
                    return (
                      <td key={r.competitor.id} className={`p-3 text-center font-mono ${val > 0 ? 'text-green-400' : val < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {val > 0 ? '+' : ''}{val.toFixed(2)}%
                      </td>
                    );
                  })}
                </tr>

                {/* Итоговая скорр. цена */}
                <tr className="bg-emerald-800/50">
                  <td className="p-3 text-emerald-100 font-semibold sticky left-0 bg-emerald-800/95">Итоговая скорр. цена</td>
                  <td className="p-3 text-center bg-emerald-700/50">—</td>
                  {correctionResults.map((r) => (
                    <td key={r.competitor.id} className="p-3 text-center text-white font-bold font-mono">
                      {Math.round(r.finalPrice).toLocaleString('ru-RU')}
                    </td>
                  ))}
                </tr>

                {/* Весовой коэффициент - редактируемый */}
                <tr className="bg-emerald-900/30">
                  <td className="p-3 text-emerald-300 sticky left-0 bg-emerald-950/95">
                    Весовой коэффициент
                    <div className="text-xs text-emerald-500 mt-1">Чем выше значение, тем больше вес</div>
                  </td>
                  <td className="p-3 text-center bg-emerald-800/30">—</td>
                  {selectedCompetitors.map((comp, idx) => {
                    const w = manualWeights[idx];
                    const isDuplicate = hasDuplicateWeight(w);
                    return (
                      <td key={comp.id} className="p-3 text-center">
                        {isEditable ? (
                          <input
                            type="number"
                            min="1"
                            value={w}
                            onChange={(e) => {
                              updateWeight(comp.id, parseInt(e.target.value) || 1);
                            }}
                            className={`w-16 px-2 py-1 rounded text-center font-mono focus:outline-none ${
                              isDuplicate 
                                ? 'bg-orange-900/50 border-2 border-orange-500 text-orange-200' 
                                : 'bg-emerald-900/50 border border-emerald-700 text-white focus:border-emerald-500'
                            }`}
                          />
                        ) : (
                          <span className={`font-mono ${isDuplicate ? 'text-orange-400' : 'text-emerald-200'}`}>
                            {w}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
                <tr className="bg-emerald-900/30">
                  <td className="p-3 text-emerald-400 text-xs sticky left-0 bg-emerald-950/95 pl-6">Нормализованный вес</td>
                  <td className="p-3 text-center bg-emerald-800/30">—</td>
                  {normalizedWeights.map((w, idx) => (
                    <td key={idx} className="p-3 text-center text-emerald-200 font-mono">
                      {(w * 100).toFixed(2)}%
                    </td>
                  ))}
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Таблица повышающих и понижающих факторов */}
      <div className="bg-emerald-900/30 rounded-xl border border-emerald-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-emerald-800/50">
              <th className="text-left p-3 text-emerald-200 font-medium">Повышающие и понижающие факторы</th>
              <th className="text-center p-3 text-emerald-200 font-medium w-32">Вес атрибута</th>
              <th className="text-center p-3 text-emerald-200 font-medium w-40">Значение</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-emerald-800/50 hover:bg-emerald-900/30">
              <td className="p-3 text-emerald-300">Какая конкуренция по ассортименту?</td>
              <td className="p-3 text-center text-emerald-400 font-mono">
                {(() => {
                  const val = plotData.marketFactors?.competition;
                  const corr = val === 'Низкая' ? 5 : val === 'Высокая' ? -5 : 0;
                  return `${corr > 0 ? '+' : ''}${corr}%`;
                })()}
              </td>
              <td className="p-3 text-center">
                {isEditable ? (
                  <select
                    value={plotData.marketFactors?.competition || 'Средняя'}
                    onChange={(e) => setPlotData({
                      ...plotData, 
                      marketFactors: { ...plotData.marketFactors, competition: e.target.value }
                    })}
                    className="bg-emerald-900/50 border border-emerald-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Низкая">Низкая</option>
                    <option value="Средняя">Средняя</option>
                    <option value="Высокая">Высокая</option>
                  </select>
                ) : (
                  <span className="text-white">{plotData.marketFactors?.competition || 'Средняя'}</span>
                )}
              </td>
            </tr>
            <tr className="border-t border-emerald-800/50 hover:bg-emerald-900/30">
              <td className="p-3 text-emerald-300">Какая коммерческая стратегия?</td>
              <td className="p-3 text-center text-emerald-400 font-mono">
                {(() => {
                  const val = plotData.marketFactors?.strategy;
                  const corr = val === 'Продать дорого' ? 3 : val === 'Продать быстро' ? -3 : 0;
                  return `${corr > 0 ? '+' : ''}${corr}%`;
                })()}
              </td>
              <td className="p-3 text-center">
                {isEditable ? (
                  <select
                    value={plotData.marketFactors?.strategy || 'Оптимально'}
                    onChange={(e) => setPlotData({
                      ...plotData, 
                      marketFactors: { ...plotData.marketFactors, strategy: e.target.value }
                    })}
                    className="bg-emerald-900/50 border border-emerald-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Продать быстро">Продать быстро</option>
                    <option value="Оптимально">Оптимально</option>
                    <option value="Продать дорого">Продать дорого</option>
                  </select>
                ) : (
                  <span className="text-white">{plotData.marketFactors?.strategy || 'Оптимально'}</span>
                )}
              </td>
            </tr>
            <tr className="border-t border-emerald-800/50 hover:bg-emerald-900/30">
              <td className="p-3 text-emerald-300">Способствует ли рынок продажам и росту?</td>
              <td className="p-3 text-center text-emerald-400 font-mono">
                {(() => {
                  const val = plotData.marketFactors?.marketGrowth;
                  const corr = val === 'Да' ? 3 : val === 'Нет' ? -3 : 0;
                  return `${corr > 0 ? '+' : ''}${corr}%`;
                })()}
              </td>
              <td className="p-3 text-center">
                {isEditable ? (
                  <select
                    value={plotData.marketFactors?.marketGrowth || 'Не особо'}
                    onChange={(e) => setPlotData({
                      ...plotData, 
                      marketFactors: { ...plotData.marketFactors, marketGrowth: e.target.value }
                    })}
                    className="bg-emerald-900/50 border border-emerald-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Да">Да</option>
                    <option value="Не особо">Не особо</option>
                    <option value="Нет">Нет</option>
                  </select>
                ) : (
                  <span className="text-white">{plotData.marketFactors?.marketGrowth || 'Не особо'}</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 rounded-xl p-6 border border-emerald-600">
        <div className="text-center">
          <div className="text-emerald-300 mb-2">Итоговая гипотеза по средней цене {priceType === 'realization' ? 'реализации' : 'прайса'}</div>
          <div className="text-4xl font-bold text-white font-mono">{Math.round(weightedPrice).toLocaleString('ru-RU')} <span className="text-xl text-emerald-400">₽/м²</span></div>
        </div>
      </div>
    </div>
  );
};

// Компонент для отображения Excel-таблицы с merge ячеек
const ExcelTableViewer = ({ file, onDataExtracted }) => {
  const [header, setHeader] = useState([]);
  const [body, setBody] = useState([]);
  const [merges, setMerges] = useState([]);
  const [sheet, setSheet] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [sheetNames, setSheetNames] = useState([]);
  const [activeSheet, setActiveSheet] = useState(0);

  const getCellBgColor = (sheet, r, c) => {
    if (!sheet) return undefined;
    const cellAddress = XLSX.utils.encode_cell({ r, c });
    const cell = sheet[cellAddress];
    if (!cell || !cell.s || !cell.s.fill) return undefined;
    const fill = cell.s.fill;
    const rgb = fill.fgColor?.rgb || fill.bgColor?.rgb;
    if (rgb && typeof rgb === "string") {
      const hex = rgb.length > 6 ? rgb.slice(-6) : rgb;
      return `#${hex}`;
    }
    return undefined;
  };

  const getMergedMatrix = (rows, sheet, merges, startRow = 0) => {
    const matrix = rows.map((row, rowIndex) =>
      (row || []).map((cell, colIndex) => {
        const bgColor = sheet ? getCellBgColor(sheet, rowIndex + startRow, colIndex) : undefined;
        return { value: cell, bgColor };
      })
    );

    // Нормализуем длину строк
    const maxCols = Math.max(...matrix.map(r => r.length), 0);
    matrix.forEach(row => {
      while (row.length < maxCols) {
        row.push({ value: undefined, bgColor: undefined });
      }
    });

    (merges || []).forEach((m) => {
      const { s, e } = m;
      const rowIndex = s.r - startRow;
      if (rowIndex < 0 || rowIndex >= matrix.length) return;
      
      const colSpan = e.c - s.c + 1;
      const rowSpan = e.r - s.r + 1;
      
      if (matrix[rowIndex] && matrix[rowIndex][s.c]) {
        matrix[rowIndex][s.c] = {
          ...matrix[rowIndex][s.c],
          colSpan,
          rowSpan,
        };
      }
      
      for (let r = s.r; r <= e.r; r++) {
        for (let c = s.c; c <= e.c; c++) {
          if (r === s.r && c === s.c) continue;
          const localRow = r - startRow;
          if (matrix[localRow] && matrix[localRow][c]) {
            matrix[localRow][c] = { ...matrix[localRow][c], hidden: true };
          }
        }
      }
    });

    return matrix;
  };

  React.useEffect(() => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result);
        const workbook = XLSX.read(data, { type: "array", cellStyles: true });
        
        setSheetNames(workbook.SheetNames);
        const sheetName = workbook.SheetNames[activeSheet] || workbook.SheetNames[0];
        const newSheet = workbook.Sheets[sheetName];
        
        const json = XLSX.utils.sheet_to_json(newSheet, { header: 1, raw: true });
        
        // Разделяем на заголовок (первые 2 строки) и тело
        const headerPart = json.slice(0, 2);
        const bodyPart = json.slice(2);
        
        setHeader(headerPart);
        setBody(bodyPart);
        setMerges(newSheet["!merges"] || []);
        setSheet(newSheet);

        // Извлекаем данные для графика (ищем колонки с ценой и продажами)
        if (onDataExtracted && json.length > 1) {
          const extractedData = [];
          const headers = json[0] || [];
          
          // Ищем индексы колонок с ценой и продажами
          let priceColIdx = -1;
          let salesColIdx = -1;
          
          headers.forEach((h, idx) => {
            const headerStr = String(h || '').toLowerCase();
            if (headerStr.includes('цена') || headerStr.includes('price') || headerStr.includes('руб')) {
              priceColIdx = idx;
            }
            if (headerStr.includes('продаж') || headerStr.includes('sales') || headerStr.includes('кв') || headerStr.includes('шт')) {
              salesColIdx = idx;
            }
          });

          // Если нашли обе колонки, извлекаем данные
          if (priceColIdx !== -1 && salesColIdx !== -1) {
            json.slice(1).forEach((row, idx) => {
              const price = parseFloat(row[priceColIdx]);
              const sales = parseFloat(row[salesColIdx]);
              if (!isNaN(price) && !isNaN(sales)) {
                extractedData.push({ price, sales, name: row[0] || `Точка ${idx + 1}` });
              }
            });
          } else {
            // Пробуем первые две числовые колонки
            json.slice(1).forEach((row, idx) => {
              const numericValues = row.filter(v => typeof v === 'number' && !isNaN(v));
              if (numericValues.length >= 2) {
                extractedData.push({ 
                  price: numericValues[0], 
                  sales: numericValues[1],
                  name: row[0] || `Точка ${idx + 1}`
                });
              }
            });
          }
          
          if (extractedData.length > 0) {
            onDataExtracted(extractedData);
          }
        }
      } catch (err) {
        console.error("Ошибка при чтении Excel:", err);
      }
    };
    reader.readAsArrayBuffer(file);
  }, [file, activeSheet, onDataExtracted]);

  const headerMatrix = sheet ? getMergedMatrix(header, sheet, merges, 0) : [];
  const bodyMatrix = sheet ? getMergedMatrix(body, sheet, merges, 2) : [];

  if (!file) return null;

  return (
    <div className="bg-emerald-900/30 rounded-xl border border-emerald-800 overflow-hidden">
      {/* Заголовок с раскрытием */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-emerald-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-100 font-semibold">{file.name}</span>
          <span className="text-emerald-500 text-sm">({body.length} строк)</span>
        </div>
        <ChevronRight className={`w-5 h-5 text-emerald-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {isExpanded && (
        <div className="border-t border-emerald-800">
          {/* Вкладки листов */}
          {sheetNames.length > 1 && (
            <div className="flex gap-1 p-2 bg-emerald-950/50 border-b border-emerald-800">
              {sheetNames.map((name, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSheet(idx)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    activeSheet === idx 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-emerald-800/50 text-emerald-300 hover:bg-emerald-700/50'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {/* Таблица */}
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 bg-emerald-900">
                {headerMatrix.map((row, i) => (
                  <tr key={`h-${i}`}>
                    {row.map((cell, j) =>
                      !cell.hidden && cell.value !== null ? (
                        <th
                          key={`h-${i}-${j}`}
                          colSpan={cell.colSpan}
                          rowSpan={cell.rowSpan}
                          style={{ backgroundColor: cell.bgColor || '#064e3b' }}
                          className="p-2 text-emerald-100 text-left border border-emerald-700 font-medium whitespace-nowrap"
                        >
                          {cell.value}
                        </th>
                      ) : null
                    )}
                  </tr>
                ))}
              </thead>
              <tbody>
                {bodyMatrix.map((row, i) => (
                  <tr key={`b-${i}`} className="hover:bg-emerald-800/30">
                    {row.map((cell, j) =>
                      !cell.hidden ? (
                        <td
                          key={`b-${i}-${j}`}
                          colSpan={cell.colSpan}
                          rowSpan={cell.rowSpan}
                          style={{ backgroundColor: cell.bgColor }}
                          className="p-2 text-white border border-emerald-800/50 whitespace-nowrap"
                        >
                          {typeof cell.value === 'number' 
                            ? cell.value.toLocaleString('ru-RU') 
                            : cell.value}
                        </td>
                      ) : null
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Компонент загрузки Excel
const ExcelUploader = ({ onFileSelect, label = "Загрузить Excel" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = React.useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
        ${isDragging 
          ? 'border-emerald-400 bg-emerald-800/30' 
          : 'border-emerald-700 hover:border-emerald-500 hover:bg-emerald-900/30'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
      />
      <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-emerald-400' : 'text-emerald-500'}`} />
      <div className="text-emerald-300 font-medium">{label}</div>
      <div className="text-emerald-500 text-sm mt-1">Перетащите файл или нажмите для выбора</div>
      <div className="text-emerald-600 text-xs mt-2">.xlsx, .xls</div>
    </div>
  );
};

// Вкладка эластичности с поддержкой Excel
const ElasticityTab = ({ data, competitors, competitorsOnly = false, calculatedPrice = 0 }) => {
  const [elasticityTableData, setElasticityTableData] = useState(elasticityData);
  const [excelFile, setExcelFile] = useState(null);
  const [excelData, setExcelData] = useState(null);
  
  // Данные для графика: из Excel если загружен, иначе из ручного ввода или конкурентов
  const chartData = useMemo(() => {
    if (competitorsOnly) {
      // Для вкладки конкурентов используем данные конкурентов + Excel если есть
      const competitorData = competitors
        .filter(c => c.selected)
        .map(c => ({ price: c.priceRealization, sales: c.salesRate, name: c.name }));
      
      if (excelData && excelData.length > 0) {
        return [...competitorData, ...excelData];
      }
      return competitorData;
    }
    
    // Для общей эластичности: Excel данные или ручной ввод
    if (excelData && excelData.length > 0) {
      return excelData;
    }
    return elasticityTableData;
  }, [competitorsOnly, competitors, excelData, elasticityTableData]);

  // Интерполяция для нахождения значения продаж по цене
  const interpolatedSales = useMemo(() => {
    if (!calculatedPrice || chartData.length < 2) return null;
    
    // Сортируем данные по цене
    const sortedData = [...chartData].sort((a, b) => a.price - b.price);
    
    // Проверяем, находится ли цена в диапазоне данных
    const minPrice = sortedData[0].price;
    const maxPrice = sortedData[sortedData.length - 1].price;
    
    if (calculatedPrice < minPrice || calculatedPrice > maxPrice) {
      // Экстраполяция: используем линейную регрессию
      const n = sortedData.length;
      const sumX = sortedData.reduce((s, d) => s + d.price, 0);
      const sumY = sortedData.reduce((s, d) => s + d.sales, 0);
      const sumXY = sortedData.reduce((s, d) => s + d.price * d.sales, 0);
      const sumX2 = sortedData.reduce((s, d) => s + d.price * d.price, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      return Math.max(0, slope * calculatedPrice + intercept);
    }
    
    // Находим два ближайших точки для интерполяции
    let lower = sortedData[0];
    let upper = sortedData[sortedData.length - 1];
    
    for (let i = 0; i < sortedData.length - 1; i++) {
      if (sortedData[i].price <= calculatedPrice && sortedData[i + 1].price >= calculatedPrice) {
        lower = sortedData[i];
        upper = sortedData[i + 1];
        break;
      }
    }
    
    // Линейная интерполяция
    if (upper.price === lower.price) return lower.sales;
    const ratio = (calculatedPrice - lower.price) / (upper.price - lower.price);
    return lower.sales + ratio * (upper.sales - lower.sales);
  }, [calculatedPrice, chartData]);

  const handleDataExtracted = useCallback((data) => {
    setExcelData(data);
  }, []);

  const clearExcel = () => {
    setExcelFile(null);
    setExcelData(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {competitorsOnly ? 'Эластичность спроса конкурентов' : 'Эластичность спроса'}
        </h2>
        {excelFile && (
          <button
            onClick={clearExcel}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-red-900/50 text-red-300 rounded-lg hover:bg-red-800/50 transition-colors"
          >
            <X className="w-4 h-4" /> Очистить Excel
          </button>
        )}
      </div>

      {/* Загрузка Excel */}
      {!excelFile ? (
        <ExcelUploader 
          onFileSelect={setExcelFile}
          label={competitorsOnly ? "Загрузить данные по конкурентам" : "Загрузить данные эластичности"}
        />
      ) : (
        <ExcelTableViewer 
          file={excelFile} 
          onDataExtracted={handleDataExtracted}
        />
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Таблица данных */}
        <div className="bg-emerald-900/30 rounded-xl p-4 border border-emerald-800">
          <h3 className="text-emerald-100 font-semibold mb-4 flex items-center gap-2">
            <Table className="w-4 h-4" />
            {excelData ? 'Извлеченные данные' : 'Данные для анализа'}
          </h3>
          
          {excelData ? (
            <div className="text-emerald-300 text-sm mb-3">
              Обнаружено {excelData.length} точек данных из Excel
            </div>
          ) : null}

          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-emerald-900">
                <tr className="border-b border-emerald-700">
                  <th className="text-left p-2 text-emerald-300">{competitorsOnly ? 'Объект' : '№'}</th>
                  <th className="text-right p-2 text-emerald-300">Цена, ₽/м²</th>
                  <th className="text-right p-2 text-emerald-300">Продажи, кв/мес</th>
                  {!competitorsOnly && !excelData && <th className="w-10"></th>}
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, idx) => (
                  <tr key={idx} className="border-b border-emerald-800/50 hover:bg-emerald-900/30">
                    <td className="p-2 text-white">{row.name || idx + 1}</td>
                    <td className="p-2 text-right">
                      {excelData || competitorsOnly ? (
                        <span className="text-white font-mono">{row.price.toLocaleString()}</span>
                      ) : (
                        <input
                          type="number"
                          value={row.price}
                          onChange={(e) => {
                            const newData = [...elasticityTableData];
                            newData[idx].price = parseInt(e.target.value) || 0;
                            setElasticityTableData(newData);
                          }}
                          className="w-24 px-2 py-1 bg-emerald-900/50 border border-emerald-700 rounded text-white text-right font-mono focus:outline-none focus:border-emerald-500"
                        />
                      )}
                    </td>
                    <td className="p-2 text-right">
                      {excelData || competitorsOnly ? (
                        <span className="text-white font-mono">{row.sales}</span>
                      ) : (
                        <input
                          type="number"
                          value={row.sales}
                          onChange={(e) => {
                            const newData = [...elasticityTableData];
                            newData[idx].sales = parseInt(e.target.value) || 0;
                            setElasticityTableData(newData);
                          }}
                          className="w-16 px-2 py-1 bg-emerald-900/50 border border-emerald-700 rounded text-white text-right font-mono focus:outline-none focus:border-emerald-500"
                        />
                      )}
                    </td>
                    {!competitorsOnly && !excelData && (
                      <td className="p-2">
                        <button
                          onClick={() => setElasticityTableData(elasticityTableData.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {!competitorsOnly && !excelData && (
            <button
              onClick={() => setElasticityTableData([...elasticityTableData, { price: 150000, sales: 8 }])}
              className="mt-3 flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" /> Добавить точку
            </button>
          )}
        </div>

        {/* График */}
        <div className="bg-emerald-900/30 rounded-xl p-4 border border-emerald-800">
          <h3 className="text-emerald-100 font-semibold mb-4">График эластичности</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartData.length > 0 ? (
                competitorsOnly || excelData ? (
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#065f46" />
                    <XAxis 
                      dataKey="price" 
                      type="number" 
                      domain={['dataMin - 10000', 'dataMax + 10000']}
                      tickFormatter={(v) => `${(v/1000).toFixed(0)}k`}
                      stroke="#6ee7b7"
                      tick={{ fill: '#a7f3d0' }}
                      label={{ value: 'Цена, ₽/м²', position: 'bottom', fill: '#6ee7b7', fontSize: 12 }}
                    />
                    <YAxis 
                      dataKey="sales" 
                      type="number"
                      domain={[0, 'dataMax + 5']}
                      stroke="#6ee7b7"
                      tick={{ fill: '#a7f3d0' }}
                      label={{ value: 'Продажи, кв/мес', angle: -90, position: 'insideLeft', fill: '#6ee7b7', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#064e3b', border: '1px solid #059669', borderRadius: '8px' }}
                      labelStyle={{ color: '#a7f3d0' }}
                      formatter={(value, name) => [
                        name === 'sales' ? `${value} кв/мес` : `${value.toLocaleString()} ₽`, 
                        name === 'sales' ? 'Продажи' : 'Цена'
                      ]}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ''}
                    />
                    <Scatter 
                      data={chartData} 
                      fill="#10b981"
                      name="Данные"
                    >
                    </Scatter>
                    {/* Перпендикуляры от расчётной цены */}
                    {calculatedPrice > 0 && interpolatedSales !== null && (
                      <>
                        {/* Вертикальная линия от оси X до точки на графике */}
                        <ReferenceLine 
                          x={calculatedPrice} 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          label={{ value: `${(calculatedPrice/1000).toFixed(0)}k`, position: 'bottom', fill: '#f59e0b', fontSize: 11 }}
                        />
                        {/* Горизонтальная линия от точки до оси Y */}
                        <ReferenceLine 
                          y={interpolatedSales} 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          label={{ value: `${interpolatedSales.toFixed(1)}`, position: 'left', fill: '#f59e0b', fontSize: 11 }}
                        />
                        {/* Точка пересечения */}
                        <ReferenceDot 
                          x={calculatedPrice} 
                          y={interpolatedSales} 
                          r={8} 
                          fill="#f59e0b" 
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      </>
                    )}
                  </ScatterChart>
                ) : (
                  <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#065f46" />
                    <XAxis 
                      dataKey="price" 
                      tickFormatter={(v) => `${(v/1000).toFixed(0)}k`}
                      stroke="#6ee7b7"
                      tick={{ fill: '#a7f3d0' }}
                    />
                    <YAxis 
                      stroke="#6ee7b7"
                      tick={{ fill: '#a7f3d0' }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#064e3b', border: '1px solid #059669', borderRadius: '8px' }}
                      labelStyle={{ color: '#a7f3d0' }}
                      formatter={(value) => [`${value} кв/мес`, 'Продажи']}
                      labelFormatter={(label) => `Цена: ${label.toLocaleString()} ₽/м²`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, fill: '#34d399' }}
                      name="Объем продаж"
                    />
                    {/* Перпендикуляры от расчётной цены */}
                    {calculatedPrice > 0 && interpolatedSales !== null && (
                      <>
                        {/* Вертикальная линия от оси X до точки на графике */}
                        <ReferenceLine 
                          x={calculatedPrice} 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          label={{ value: `${(calculatedPrice/1000).toFixed(0)}k`, position: 'top', fill: '#f59e0b', fontSize: 11 }}
                        />
                        {/* Горизонтальная линия от точки до оси Y */}
                        <ReferenceLine 
                          y={interpolatedSales} 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          label={{ value: `${interpolatedSales.toFixed(1)}`, position: 'right', fill: '#f59e0b', fontSize: 11 }}
                        />
                        {/* Точка пересечения */}
                        <ReferenceDot 
                          x={calculatedPrice} 
                          y={interpolatedSales} 
                          r={8} 
                          fill="#f59e0b" 
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      </>
                    )}
                  </LineChart>
                )
              ) : (
                <div className="h-full flex items-center justify-center text-emerald-500">
                  Нет данных для отображения
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Прогноз на основе расчётной цены */}
      {calculatedPrice > 0 && interpolatedSales !== null && (
        <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-xl p-4 border border-amber-700">
          <h3 className="text-amber-100 font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            Прогноз продаж по расчётной цене
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-amber-800/30 rounded-lg p-4">
              <div className="text-amber-400 text-xs mb-1">Расчётная цена (из корректировок)</div>
              <div className="text-white text-2xl font-bold font-mono">{calculatedPrice.toLocaleString()} <span className="text-sm text-amber-400">₽/м²</span></div>
            </div>
            <div className="bg-amber-800/30 rounded-lg p-4">
              <div className="text-amber-400 text-xs mb-1">Прогнозируемые продажи</div>
              <div className="text-white text-2xl font-bold font-mono">{interpolatedSales.toFixed(1)} <span className="text-sm text-amber-400">кв/мес</span></div>
            </div>
            <div className="bg-amber-800/30 rounded-lg p-4">
              <div className="text-amber-400 text-xs mb-1">Оценка спроса</div>
              <div className={`text-2xl font-bold ${
                interpolatedSales >= 10 ? 'text-green-400' : 
                interpolatedSales >= 6 ? 'text-emerald-400' : 
                interpolatedSales >= 3 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {interpolatedSales >= 10 ? 'Высокий' : 
                 interpolatedSales >= 6 ? 'Стабильный' : 
                 interpolatedSales >= 3 ? 'Умеренный' : 'Низкий'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Статистика */}
      {chartData.length > 0 && (
        <div className="bg-emerald-900/30 rounded-xl p-4 border border-emerald-800">
          <h3 className="text-emerald-100 font-semibold mb-3">Статистика</h3>
          <div className="grid grid-cols-5 gap-4 text-sm">
            <div className="bg-emerald-800/30 rounded-lg p-3">
              <div className="text-emerald-400 text-xs">Точек данных</div>
              <div className="text-white text-lg font-semibold">{chartData.length}</div>
            </div>
            <div className="bg-emerald-800/30 rounded-lg p-3">
              <div className="text-emerald-400 text-xs">Мин. цена</div>
              <div className="text-white text-lg font-semibold font-mono">
                {Math.min(...chartData.map(d => d.price)).toLocaleString()}
              </div>
            </div>
            <div className="bg-emerald-800/30 rounded-lg p-3">
              <div className="text-emerald-400 text-xs">Макс. цена</div>
              <div className="text-white text-lg font-semibold font-mono">
                {Math.max(...chartData.map(d => d.price)).toLocaleString()}
              </div>
            </div>
            <div className="bg-emerald-800/30 rounded-lg p-3">
              <div className="text-emerald-400 text-xs">Ср. продажи</div>
              <div className="text-white text-lg font-semibold font-mono">
                {(chartData.reduce((s, d) => s + d.sales, 0) / chartData.length).toFixed(1)}
              </div>
            </div>
            <div className="bg-emerald-800/30 rounded-lg p-3">
              <div className="text-emerald-400 text-xs">Ср. цена</div>
              <div className="text-white text-lg font-semibold font-mono">
                {Math.round(chartData.reduce((s, d) => s + d.price, 0) / chartData.length).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Интерпретация */}
      <div className="bg-emerald-900/30 rounded-xl p-4 border border-emerald-800">
        <h3 className="text-emerald-100 font-semibold mb-3">Интерпретация</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="bg-green-900/30 rounded-lg p-3 border border-green-700">
            <div className="text-green-400 font-semibold">свыше 10 кв/мес</div>
            <div className="text-green-300 text-xs mt-1">Высокий спрос. Благоприятные условия для входа.</div>
          </div>
          <div className="bg-emerald-900/50 rounded-lg p-3 border border-emerald-700">
            <div className="text-emerald-400 font-semibold">6–10 кв/мес</div>
            <div className="text-emerald-300 text-xs mt-1">Стабильный спрос. Рынок в равновесии.</div>
          </div>
          <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-700">
            <div className="text-yellow-400 font-semibold">3–5 кв/мес</div>
            <div className="text-yellow-300 text-xs mt-1">Умеренный спрос. Требуется анализ.</div>
          </div>
          <div className="bg-red-900/30 rounded-lg p-3 border border-red-700">
            <div className="text-red-400 font-semibold">менее 3 кв/мес</div>
            <div className="text-red-300 text-xs mt-1">Низкий спрос. Высокие риски.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Основной компонент приложения
export default function App() {
  const [activeTab, setActiveTab] = useState('general');
  
  // Начальные данные участка
  const defaultPlotData = {
    plotName: 'Энергетиков',
    city: 'Пермь',
    executionDate: new Date().toISOString(),
    area: '3.63',
    cadastralNumber: '59:01:4413798:316; 59:01:4413798:329',
    address: 'Пермь, Энергетиков',
    genPlan: 'Промышленные и складские объекты IV класса вредности',
    housingClass: 'Комфорт',
    finishing: 'Предчистовая',
    wallMaterial: 'Монолит-кирпич',
    reputation: '-',
    floors: '12 - 15',
    productAnalog: 'Беседа',
    apartmentType: 'Евро',
    parkingTypes: { underground: true, multilevel: false, surface: false },
    parkingCostUnderground: 1.5,
    parkingCostMultilevel: null,
    distanceToStop: 250,
    transport: { busTrolley: 1, tram: 0, metro: false },
    socialInfra: { schools: 0, kindergartens: 0, malls: false, clinics: false },
    viewCharacteristics: { gsk: true, industrial: false, railway: false, sea: false, panorama: false, river: false, forest: false, cemetery: false },
    apartmentMix: { studio: 15, one: 15, onePlus: 20, two: 15, twoPlus: 20, three: 10, four: 5 },
    prices: { studio: 160000, one: 154000, onePlus: 148000, two: 142000, twoPlus: 136000, three: 130000, four: 125000 },
    competitorWeights: {},
    // Повышающие и понижающие факторы
    marketFactors: {
      competition: 'Средняя',      // Низкая (+5%), Средняя (0%), Высокая (-5%)
      strategy: 'Оптимально',      // Продать быстро (-3%), Оптимально (0%), Продать дорого (+3%)
      marketGrowth: 'Не особо'     // Да (+3%), Не особо (0%), Нет (-3%)
    }
  };

  // Загрузка данных из localStorage при инициализации
  const [competitors, setCompetitors] = useState(() => {
    try {
      const saved = localStorage.getItem('landAnalysis_competitors');
      if (saved) {
        // Миграция старых данных viewCharacteristics
        const parsed = JSON.parse(saved);
        return parsed.map(c => ({
          ...c,
          viewCharacteristics: {
            sea: c.viewCharacteristics?.sea || false,
            panorama: c.viewCharacteristics?.panorama || false,
            river: c.viewCharacteristics?.river || false,
            forest: c.viewCharacteristics?.forest || false,
            railway: c.viewCharacteristics?.railway || false,
            gsk: c.viewCharacteristics?.gsk || false,
            industrial: c.viewCharacteristics?.industrial || c.viewCharacteristics?.promzona || false,
            cemetery: c.viewCharacteristics?.cemetery || false
          }
        }));
      }
      return initialCompetitors;
    } catch {
      return initialCompetitors;
    }
  });

  const [plotData, setPlotData] = useState(() => {
    try {
      const saved = localStorage.getItem('landAnalysis_plotData');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Миграция старых данных viewCharacteristics
        return {
          ...parsed,
          viewCharacteristics: {
            sea: parsed.viewCharacteristics?.sea || false,
            panorama: parsed.viewCharacteristics?.panorama || false,
            river: parsed.viewCharacteristics?.river || false,
            forest: parsed.viewCharacteristics?.forest || false,
            railway: parsed.viewCharacteristics?.railway || false,
            gsk: parsed.viewCharacteristics?.gsk || false,
            industrial: parsed.viewCharacteristics?.industrial || parsed.viewCharacteristics?.promzona || false,
            cemetery: parsed.viewCharacteristics?.cemetery || false
          }
        };
      }
      return defaultPlotData;
    } catch {
      return defaultPlotData;
    }
  });

  // Сохранение данных в localStorage при изменении
  React.useEffect(() => {
    try {
      localStorage.setItem('landAnalysis_competitors', JSON.stringify(competitors));
    } catch (e) {
      console.warn('Не удалось сохранить данные конкурентов:', e);
    }
  }, [competitors]);

  React.useEffect(() => {
    try {
      localStorage.setItem('landAnalysis_plotData', JSON.stringify(plotData));
    } catch (e) {
      console.warn('Не удалось сохранить данные участка:', e);
    }
  }, [plotData]);

  // Реф для контейнера контента и состояние экспорта
  const contentRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  // Функция экспорта в PDF
  const exportToPDF = async () => {
    setIsExporting(true);
    
    try {
      // Альбомная ориентация ('l' = landscape)
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth(); // 297mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 210mm
      
      // Целевое разрешение Full HD
      const targetWidth = 1920;
      const targetHeight = 1080;
      
      // Сохраняем текущую вкладку
      const originalTab = activeTab;
      
      // Функция для захвата вкладки с фиксированным разрешением
      const captureTab = async (tabId) => {
        setActiveTab(tabId);
        await new Promise(resolve => setTimeout(resolve, 400));
        
        if (!contentRef.current) return null;
        
        // Создаём контейнер с фиксированными размерами Full HD
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: ${targetWidth}px;
          height: ${targetHeight}px;
          z-index: -9999;
          background: #064e3b;
          overflow: hidden;
        `;
        
        // Клонируем контент
        const clone = contentRef.current.cloneNode(true);
        
        // Вычисляем масштаб чтобы контент вписался в Full HD
        const contentWidth = contentRef.current.scrollWidth;
        const contentHeight = contentRef.current.scrollHeight;
        const scaleX = targetWidth / contentWidth;
        const scaleY = targetHeight / contentHeight;
        const scale = Math.min(scaleX, scaleY); // Вписываем с сохранением пропорций
        
        clone.style.cssText = `
          transform: scale(${scale});
          transform-origin: top left;
          width: ${contentWidth}px;
          height: ${contentHeight}px;
        `;
        
        wrapper.appendChild(clone);
        document.body.appendChild(wrapper);
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Захватываем с разрешением Full HD
        const canvas = await html2canvas(wrapper, {
          scale: 1, // Уже в нужном разрешении
          useCORS: true,
          logging: false,
          backgroundColor: '#064e3b',
          width: targetWidth,
          height: targetHeight
        });
        
        document.body.removeChild(wrapper);
        
        return canvas;
      };
      
      // Функция размещения изображения на странице с сохранением пропорций
      const addImageToPage = (imgData, canvasWidth, canvasHeight) => {
        const imgRatio = canvasWidth / canvasHeight; // 16:9 = 1.777
        const pageRatio = pageWidth / pageHeight; // A4 = 1.414
        
        let finalWidth, finalHeight, offsetX, offsetY;
        
        // Изображение шире (16:9 > 1.414) — подгоняем по ширине
        finalWidth = pageWidth;
        finalHeight = pageWidth / imgRatio;
        offsetX = 0;
        offsetY = (pageHeight - finalHeight) / 2;
        
        // Заливаем фон
        pdf.setFillColor(6, 78, 59);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Добавляем изображение по центру
        pdf.addImage(imgData, 'JPEG', offsetX, offsetY, finalWidth, finalHeight);
      };
      
      // Экспортируем "Общая информация"
      const canvas1 = await captureTab('general');
      if (canvas1) {
        const imgData1 = canvas1.toDataURL('image/jpeg', 0.92);
        addImageToPage(imgData1, canvas1.width, canvas1.height);
      }
      
      // Добавляем страницу для "Эластичность спроса"
      pdf.addPage('a4', 'l');
      
      const canvas2 = await captureTab('elasticity');
      if (canvas2) {
        const imgData2 = canvas2.toDataURL('image/jpeg', 0.92);
        addImageToPage(imgData2, canvas2.width, canvas2.height);
      }
      
      setActiveTab(originalTab);
      
      const fileName = `Анализ_${plotData.plotName || 'участка'}_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Ошибка экспорта PDF:', error);
      alert('Произошла ошибка при экспорте в PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // Функция сброса данных к начальным значениям
  const resetToDefaults = () => {
    if (window.confirm('Вы уверены, что хотите сбросить все данные к начальным значениям?')) {
      setPlotData(defaultPlotData);
      setCompetitors(initialCompetitors);
      localStorage.removeItem('landAnalysis_plotData');
      localStorage.removeItem('landAnalysis_competitors');
    }
  };

  // Вычисление итоговой цены из корректировок (реализация)
  const calculatedPrice = useMemo(() => {
    const selectedCompetitors = competitors.filter(c => c.selected);
    if (selectedCompetitors.length === 0) return 0;

    // Функция расчёта корректировок (дублирует логику из CorrectionsTab)
    const calculateCorrections = (competitor) => {
      let price = competitor.priceRealization;

      // 1. Готовность объекта
      if (competitor.readiness > 0) {
        const readinessFactor = (competitor.readiness / 100) * 0.1;
        price = price / (1 + readinessFactor);
      }

      // 2. Расстояние до остановки
      const distanceCorr = ((competitor.distanceToStop || 0) - (plotData.distanceToStop || 0)) / 200;
      price = price * (1 + distanceCorr / 100);

      // 3. Транспортная доступность
      const plotTransport = (plotData.transport?.busTrolley || 0) + (plotData.transport?.tram || 0) + (plotData.transport?.metro ? 2 : 0);
      const compTransport = (competitor.transport?.buses || 0) + (competitor.transport?.trolleys || 0) + (competitor.transport?.trams || 0) + (competitor.transport?.metro ? 2 : 0);
      let transportCorr = 0;
      if (compTransport > plotTransport + 2) transportCorr = -3;
      else if (plotTransport > compTransport + 2) transportCorr = 3;
      price = price * (1 + transportCorr / 100);

      // 4. Социальная инфраструктура
      let infraCorr = 0;
      const plotSchools = plotData.socialInfra?.schools || 0;
      const plotKindergartens = plotData.socialInfra?.kindergartens || 0;
      const plotMalls = plotData.socialInfra?.malls || false;
      const plotClinics = plotData.socialInfra?.clinics || false;
      if (competitor.infrastructure.schools > plotSchools) infraCorr -= 2;
      else if (competitor.infrastructure.schools < plotSchools) infraCorr += 2;
      if (competitor.infrastructure.kindergartens > plotKindergartens) infraCorr -= 2;
      else if (competitor.infrastructure.kindergartens < plotKindergartens) infraCorr += 2;
      if (competitor.infrastructure.malls > 0 && !plotMalls) infraCorr -= 1;
      else if (competitor.infrastructure.malls === 0 && plotMalls) infraCorr += 1;
      if (competitor.infrastructure.clinics > 0 && !plotClinics) infraCorr -= 1;
      else if (competitor.infrastructure.clinics === 0 && plotClinics) infraCorr += 1;
      price = price * (1 + infraCorr / 100);

      // 5. Материал стен
      let wallCorr = 0;
      const plotWall = plotData.wallMaterial || 'Монолит-кирпич';
      const compWall = competitor.wallMaterial;
      if (plotWall === 'Панель' && (compWall === 'Монолит-кирпич' || compWall === 'Кирпич')) wallCorr = -10;
      else if ((plotWall === 'Монолит-кирпич' || plotWall === 'Кирпич') && compWall === 'Панель') wallCorr = 10;
      price = price * (1 + wallCorr / 100);

      // 6. Репутация застройщика
      let repCorr = 0;
      const plotRep = plotData.reputation || '-';
      const compRep = competitor.reputation;
      if (plotRep === '-' && compRep === '+') repCorr = -5;
      else if (plotRep === '+' && compRep === '-') repCorr = 5;
      price = price * (1 + repCorr / 100);

      // 7. Отделка
      let finishCorr = 0;
      const finishingOrder = ['Черновая', 'Предчистовая', 'Чистовая'];
      const plotFinishIdx = finishingOrder.indexOf(plotData.finishing || 'Предчистовая');
      const compFinishIdx = finishingOrder.indexOf(competitor.finishing);
      if (compFinishIdx > plotFinishIdx) finishCorr = (compFinishIdx - plotFinishIdx) * -13;
      else if (compFinishIdx < plotFinishIdx) finishCorr = (plotFinishIdx - compFinishIdx) * 13;
      price = price * (1 + finishCorr / 100);

      // 8. Класс жилья
      let classCorr = 0;
      const classOrder = ['Стандарт', 'Комфорт', 'Комфорт+', 'Бизнес', 'Элит'];
      const plotClassIdx = classOrder.indexOf(plotData.housingClass || 'Комфорт');
      const compClassIdx = classOrder.indexOf(competitor.housingClass);
      if (compClassIdx > plotClassIdx) classCorr = (compClassIdx - plotClassIdx) * -5;
      else if (compClassIdx < plotClassIdx) classCorr = (plotClassIdx - compClassIdx) * 5;
      price = price * (1 + classCorr / 100);

      // 9. Видовые характеристики
      let viewCorr = 0;
      const plotView = plotData.viewCharacteristics || {};
      const compView = competitor.viewCharacteristics || {};
      
      VIEW_CHARACTERISTICS_OPTIONS.forEach(opt => {
        const plotHas = plotView[opt.key] || false;
        const compHas = compView[opt.key] || false;
        
        if (plotHas && !compHas) {
          viewCorr += opt.correction;
        } else if (!plotHas && compHas) {
          viewCorr -= opt.correction;
        }
      });
      // Ограничение корректировки видовых характеристик до ±15%
      viewCorr = Math.max(-15, Math.min(15, viewCorr));
      price = price * (1 + viewCorr / 100);

      // 10. Характеристики квартир
      let aptCorr = 0;
      const aptOrder = ['Стандарт', 'Евро', 'Уникальное'];
      const plotAptIdx = aptOrder.indexOf(plotData.apartmentType || 'Евро');
      const compAptIdx = aptOrder.indexOf(competitor.apartmentType || 'Евро');
      if (compAptIdx > plotAptIdx) aptCorr = (compAptIdx - plotAptIdx) * -10;
      else if (compAptIdx < plotAptIdx) aptCorr = (plotAptIdx - compAptIdx) * 10;
      price = price * (1 + aptCorr / 100);

      return price;
    };

    // Расчёт весов и итоговой цены
    const savedWeights = plotData.competitorWeights || {};
    const manualWeights = selectedCompetitors.map((c, idx) => savedWeights[c.id] ?? (idx + 1));
    const totalWeightSum = manualWeights.reduce((a, b) => a + b, 0);
    const normalizedWeights = manualWeights.map(w => totalWeightSum > 0 ? w / totalWeightSum : 1 / manualWeights.length);

    const baseWeightedPrice = selectedCompetitors.reduce((sum, c, idx) => {
      const finalPrice = calculateCorrections(c);
      return sum + finalPrice * normalizedWeights[idx];
    }, 0);

    // Расчёт корректировки от факторов
    const factors = plotData.marketFactors || {};
    let factorsCorrection = 0;
    
    if (factors.competition === 'Низкая') factorsCorrection += 5;
    else if (factors.competition === 'Высокая') factorsCorrection -= 5;
    
    if (factors.strategy === 'Продать быстро') factorsCorrection -= 3;
    else if (factors.strategy === 'Продать дорого') factorsCorrection += 3;
    
    if (factors.marketGrowth === 'Да') factorsCorrection += 3;
    else if (factors.marketGrowth === 'Нет') factorsCorrection -= 3;

    const weightedPrice = baseWeightedPrice * (1 + factorsCorrection / 100);

    return Math.round(weightedPrice);
  }, [competitors, plotData]);

  const tabs = [
    { id: 'general', icon: MapPin, label: 'Общая информация' },
    { id: 'corrections-real', icon: TrendingUp, label: 'Корректировки (Реализ.)' },
    { id: 'corrections-price', icon: BarChart3, label: 'Корректировки (Прайс)' },
    { id: 'elasticity', icon: TrendingUp, label: 'Эластичность спроса' },
    { id: 'elasticity-comp', icon: Users, label: 'Эластичность конкурентов' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 flex">
      {/* Боковая панель навигации */}
      <nav className="w-64 bg-emerald-950/80 border-r border-emerald-800 flex flex-col">
        <div className="p-4 border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold">Анализ ЗУ</h1>
              <p className="text-emerald-400 text-xs">Справка по участку</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-3 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-900/50'
                  : 'text-emerald-300 hover:bg-emerald-800/50 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-emerald-800 space-y-3">
          <button
            onClick={exportToPDF}
            disabled={isExporting}
            className="w-full px-3 py-2 text-xs bg-emerald-700 hover:bg-emerald-600 border border-emerald-600 rounded-lg text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait"
          >
            {isExporting ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Экспорт...
              </>
            ) : (
              <>
                <Download className="w-3 h-3" />
                Экспорт в PDF
              </>
            )}
          </button>
          <button
            onClick={resetToDefaults}
            className="w-full px-3 py-2 text-xs bg-emerald-900/50 hover:bg-red-900/50 border border-emerald-700 hover:border-red-600 rounded-lg text-emerald-400 hover:text-red-400 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-3 h-3" />
            Сбросить данные
          </button>
          <div className="text-emerald-500 text-xs">Версия 1.02</div>
          <div className="text-emerald-400 text-xs">© 2024-2026 Аналитика ЗУ</div>
        </div>
      </nav>

      {/* Основной контент */}
      <main ref={contentRef} className="flex-1 p-6 overflow-auto">
        {activeTab === 'general' && (
          <GeneralInfoTab 
            data={plotData} 
            setData={setPlotData} 
            competitors={competitors}
            setCompetitors={setCompetitors}
          />
        )}
        {activeTab === 'corrections-real' && (
          <CorrectionsTab 
            competitors={competitors}
            setCompetitors={setCompetitors}
            plotData={plotData}
            setPlotData={setPlotData}
            priceType="realization"
          />
        )}
        {activeTab === 'corrections-price' && (
          <CorrectionsTab 
            competitors={competitors}
            setCompetitors={null}
            plotData={plotData}
            setPlotData={null}
            priceType="price"
          />
        )}
        {activeTab === 'elasticity' && (
          <ElasticityTab 
            data={plotData}
            competitors={competitors}
            competitorsOnly={false}
            calculatedPrice={calculatedPrice}
          />
        )}
        {activeTab === 'elasticity-comp' && (
          <ElasticityTab 
            data={plotData}
            competitors={competitors}
            competitorsOnly={true}
            calculatedPrice={calculatedPrice}
          />
        )}
      </main>
    </div>
  );
}
