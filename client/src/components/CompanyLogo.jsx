import { useState } from 'react';

export default function CompanyLogo({ company, size = 'md', className = '' }) {
  const [error, setError] = useState(false);

  if (!company) return null;

  const name = company.name || company.companyName || '';
  const firstLetter = name ? name[0].toUpperCase() : '?';

  // Normalize name to guess domain for real-time Clearbit Logo retrieval
  const getLogoUrl = () => {
    if (company.logo && company.logo.startsWith('http')) {
      if (company.logo.includes('clearbit.com')) {
        const domain = company.logo.split('/').pop();
        return `https://logos.hunter.io/${domain}`;
      }
      return company.logo;
    }
    // Clean name by removing common corporate suffixes to get the core brand name
    let cleanName = name.toLowerCase();
    const suffixes = [
      ' technology sa', ' technology', ' technologies', ' sa', ' inc', ' co', 
      ' corporation', ' corp', ' plc', ' ltd', ' limited', ' group', 
      ' solutions', ' systems', ' services', ' labs', ' holding', ' holdings',
      ' incorporated', ' & co', ' and co', ' gmbh', ' ag', ' s.a.', ' l.l.c.', ' llc'
    ];
    
    // Sort suffixes by length descending to prevent partial matches
    suffixes.sort((a, b) => b.length - a.length);
    
    for (const suffix of suffixes) {
      if (cleanName.endsWith(suffix)) {
        cleanName = cleanName.slice(0, -suffix.length).trim();
      }
    }

    const normalized = cleanName.replace(/[^a-z0-9]/g, '');
    
    const knownDomains = {
      google: 'google.com',
      microsoft: 'microsoft.com',
      amazon: 'amazon.com',
      wipro: 'wipro.com',
      infosys: 'infosys.com',
      razorpay: 'razorpay.com',
      phonepe: 'phonepe.com',
      salesforce: 'salesforce.com',
      tesla: 'tesla.com',
      stripe: 'stripe.com',
      meta: 'meta.com',
      adobe: 'adobe.com',
      elililly: 'lilly.com',
      elilillyand: 'lilly.com',
      elilillyandco: 'lilly.com',
      cvshealth: 'cvs.com',
      cvs: 'cvs.com',
      tcs: 'tcs.com',
      tataconsultancy: 'tcs.com',
      zomato: 'zomato.com',
      netflix: 'netflix.com',
      apple: 'apple.com',
      spotify: 'spotify.com',
      spotifytechnology: 'spotify.com',
      spotifytechnologysa: 'spotify.com',
      pinterest: 'pinterest.com',
      snap: 'snapchat.com',
      snapchat: 'snapchat.com',
      snapinc: 'snapchat.com',
      swiggy: 'swiggy.com',
      paytm: 'paytm.com',
      cred: 'cred.club',
      ola: 'olacabs.com',
      uber: 'uber.com',
      lyft: 'lyft.com',
      airbnb: 'airbnb.com',
      zoom: 'zoom.us',
      slack: 'slack.com',
      figma: 'figma.com',
      notion: 'notion.so',
      github: 'github.com',
      gitlab: 'gitlab.com',
      atlassian: 'atlassian.com',
      trello: 'trello.com',
      facebook: 'facebook.com',
      instagram: 'instagram.com',
      twitter: 'x.com',
      linkedin: 'linkedin.com',
      oracle: 'oracle.com',
      ibm: 'ibm.com',
      hp: 'hp.com',
      dell: 'dell.com',
      intel: 'intel.com',
      amd: 'amd.com',
      nvidia: 'nvidia.com',
      cisco: 'cisco.com',
      accenture: 'accenture.com',
      capgemini: 'capgemini.com',
      cognizant: 'cognizant.com',
      hcl: 'hcltech.com',
      techmahindra: 'techmahindra.com',
      byjus: 'byjus.com',
      unacademy: 'unacademy.com',
      physicswallah: 'pw.live',
      flipkart: 'flipkart.com',
      meesho: 'meesho.com',
      myntra: 'myntra.com',
      nykaa: 'nykaa.com',
      lenskart: 'lenskart.com',
      zepto: 'zepto.cash',
      blinkit: 'blinkit.com',
      dunzo: 'dunzo.in',
      inmobi: 'inmobi.com',
      sharechat: 'sharechat.com',
      dailyhunt: 'dailyhunt.in',
      jio: 'jio.com',
      airtel: 'airtel.in',
      vi: 'myvi.in',
      tata: 'tata.com',
      reliance: 'relianceindustries.com',
      adani: 'adani.com',
      birla: 'adityabirla.com',
      mahindra: 'mahindra.com',
      bajaj: 'bajajauto.com',
      maruti: 'marutisuzuki.com',
      hyundai: 'hyundai.com',
      toyota: 'toyota.com',
      honda: 'honda.com',
      bmw: 'bmw.com',
      mercedes: 'mercedes-benz.com',
      audi: 'audi.com',
      tesla: 'tesla.com',
      spacex: 'spacex.com',
      disney: 'disney.com',
      sony: 'sony.com',
      youtube: 'youtube.com',
      twitch: 'twitch.tv',
      reddit: 'reddit.com',
      quora: 'quora.com',
      medium: 'medium.com',
      patreon: 'patreon.com',
      substack: 'substack.com',
      tumblr: 'tumblr.com',
      flickr: 'flickr.com',
      imgur: 'imgur.com',
      behance: 'behance.net',
      dribbble: 'dribbble.com',
      unsplash: 'unsplash.com',
      shutterstock: 'shutterstock.com',
      discord: 'discord.com',
      telegram: 'telegram.org',
      whatsapp: 'whatsapp.com',
      signal: 'signal.org',
      wechat: 'wechat.com',
      alipay: 'alipay.com',
      alibaba: 'alibaba.com',
      ebay: 'ebay.com',
      etsy: 'etsy.com',
      walmart: 'walmart.com',
      target: 'target.com',
      costco: 'costco.com',
      ikea: 'ikea.com',
      starbucks: 'starbucks.com',
      mcdonalds: 'mcdonalds.com',
      subway: 'subway.com',
      burgerking: 'bk.com',
      dominos: 'dominos.com',
      cocacola: 'coca-cola.com',
      pepsico: 'pepsico.com',
      nestle: 'nestle.com',
      unilever: 'unilever.com',
      pg: 'pg.com',
      loreal: 'loreal.com',
      johnson: 'jnj.com',
      pfizer: 'pfizer.com',
      moderna: 'modernatx.com',
      walgreens: 'walgreens.com',
    };
    
    const domain = knownDomains[normalized] || `${normalized}.com`;
    return `https://logos.hunter.io/${domain}`;
  };

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg text-xs p-1',
    md: 'w-10 h-10 rounded-xl text-base p-1.5',
    lg: 'w-16 h-16 rounded-2xl text-xl p-2.5',
    xl: 'w-20 h-20 rounded-2xl text-3xl p-3.5',
  };

  const imgRoundClasses = {
    sm: 'rounded-[4px]',
    md: 'rounded-[6px]',
    lg: 'rounded-[10px]',
    xl: 'rounded-[12px]',
  };

  const defaultSize = sizeClasses[size] || sizeClasses.md;
  const imgRound = imgRoundClasses[size] || imgRoundClasses.md;

  if (error) {
    return (
      <div 
        className={`${defaultSize} bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border border-slate-200/50 dark:border-slate-800/80 flex items-center justify-center font-black text-primary-color flex-shrink-0 select-none hover:scale-105 hover:shadow-[0_4px_12px_rgba(59,130,246,0.1)] transition-all duration-300 ${className}`}
      >
        {firstLetter}
      </div>
    );
  }

  return (
    <div 
      className={`${defaultSize} bg-white flex items-center justify-center border border-slate-200/40 dark:border-white/10 overflow-hidden flex-shrink-0 hover:scale-105 hover:shadow-[0_4px_16px_rgba(59,130,246,0.12)] transition-all duration-300 select-none shadow-[0_2px_8px_rgba(0,0,0,0.03)] ${className}`}
    >
      <img
        src={getLogoUrl()}
        alt={`${name} Logo`}
        className={`w-full h-full object-contain ${imgRound}`}
        onError={() => setError(true)}
      />
    </div>
  );
}
