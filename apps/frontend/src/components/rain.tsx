import { useEffect } from 'react';

export function Rain() {
  useEffect(() => {
    const makeItRain = () => {
      const rainContainer = document.querySelector('.rain');
      if (!rainContainer) return;

      rainContainer.innerHTML = '';
      
      let increment = 0;
      let drops = "";
      
      while (increment < 100) {
        const randoHundo = Math.floor(Math.random() * (1000 - 1 + 1) + 1);
        const randoFiver = Math.floor(Math.random() * (8 - 2 + 1) + 2);
        
        increment += randoFiver;
        
        drops += `
          <div class="drop" style="left: ${increment}%; bottom: ${randoFiver + randoFiver - 1 + 100}%; animation-delay: 0.${randoHundo}s; animation-duration: 0.5${randoHundo}s;">
            <div class="stem" style="animation-delay: 0.${randoHundo}s; animation-duration: 0.5${randoHundo}s;"></div>
            <div class="splat" style="animation-delay: 0.${randoHundo}s; animation-duration: 0.5${randoHundo}s;"></div>
          </div>
        `;
      }
      
      rainContainer.innerHTML = drops;
    };

    makeItRain();
  }, []);

  return <div className="rain"></div>;
}