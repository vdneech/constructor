export const renderHighlighted = (text) => {
  if (!text) return '';

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Подсвечиваем теги и контент цветом, НО НЕ МЕНЯЕМ жирность или шрифт
    .replace(/(&lt;b&gt;)(.*?)(&lt;\/b&gt;)/gi, 
      '<span style="color: #9ca3af; ">$1</span><span style="font-weight: 600;  color: #000000;">$2</span><span style="color: #9ca3af;">$3</span>')
    .replace(/(&lt;i&gt;)(.*?)(&lt;\/i&gt;)/gi, 
      '<span style="color: #9ca3af;">$1</span><span style="font-style: italic; color: #000000;">$2</span><span style="color: #9ca3af;">$3</span>')
    .replace(/(&lt;code&gt;)(.*?)(&lt;\/code&gt;)/gi, 
      '<span style="color: #9ca3af;">$1</span><span  style="color: #000000; background: #e9e9e9; border-radius: 5px;">$2</span><span style="color: #9ca3af;">$3</span>')
    .replace(/(&lt;a href=.*?&gt;)(.*?)(&lt;\/a&gt;)/gi, 
      '<span style="color: #9ca3af;">$1</span><span style="color: #2481cc; text-decoration: underline;">$2</span><span style="color: #9ca3af;">$3</span>');
    // НИКАКИХ .replace(/\n/g, '<br/>') !
};