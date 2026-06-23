// ============================================================
// VisualJsonArticlePage.tsx
// Next.js App Router / TypeScript strict / CSS Modules
// ============================================================

'use client';

import { useMemo } from 'react';
import type { ReactNode } from 'react';
import styles from './visual-json-article.module.css';
import type {
  VisualArticleData,
  ArticleBlock,
  InfoBoxContent,
  CharacterId,
  InfoBoxType,
} from '@/types/visual-article';

function IconBase({ children, size = 20, strokeWidth = 2 }: { children: ReactNode; size?: number; strokeWidth?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

function WindIcon({ size = 26, strokeWidth = 2.5 }: { size?: number; strokeWidth?: number }) {
  return <IconBase size={size} strokeWidth={strokeWidth}><path d="M3 8h10.5a2.5 2.5 0 1 0-2.4-3.2" /><path d="M3 12h15.5a2.5 2.5 0 1 1-2.4 3.2" /><path d="M3 16h8" /></IconBase>;
}

function CircleDotIcon({ size = 26, strokeWidth = 2.5 }: { size?: number; strokeWidth?: number }) {
  return <IconBase size={size} strokeWidth={strokeWidth}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2" /></IconBase>;
}

function ZapIcon({ size = 26, strokeWidth = 2.5 }: { size?: number; strokeWidth?: number }) {
  return <IconBase size={size} strokeWidth={strokeWidth}><path d="M13 2 3 14h9l-1 8 10-12h-9z" /></IconBase>;
}

function SparklesIcon({ size = 20 }: { size?: number }) {
  return <IconBase size={size}><path d="m12 3-1.2 3.2L7.5 7.5l3.3 1.3L12 12l1.2-3.2 3.3-1.3-3.3-1.3z" /><path d="m5 14-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8z" /><path d="m19 13-.8 2.2-2.2.8 2.2.8L19 19l.8-2.2L22 16l-2.2-.8z" /></IconBase>;
}

function CheckCircleIcon({ size = 20 }: { size?: number }) {
  return <IconBase size={size}><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></IconBase>;
}

function AlertTriangleIcon({ size = 20 }: { size?: number }) {
  return <IconBase size={size}><path d="M10.3 3.7 2.5 17.2A2 2 0 0 0 4.2 20h15.6a2 2 0 0 0 1.7-2.8L13.7 3.7a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></IconBase>;
}

function ClockIcon({ size = 14 }: { size?: number }) {
  return <IconBase size={size}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></IconBase>;
}

const systemIcons: Record<string, ReactNode> = {
  wind: <WindIcon size={26} strokeWidth={2.5} />,
  circleDot: <CircleDotIcon size={26} strokeWidth={2.5} />,
  zap: <ZapIcon size={26} strokeWidth={2.5} />,
};

const infoBoxConfig: Record<
  InfoBoxType,
  {
    icon: ReactNode;
    boxClass: string;
    labelClass: string;
    label: string;
  }
> = {
  point: {
    icon: <SparklesIcon size={20} />,
    boxClass: styles.infoBoxPoint,
    labelClass: styles.infoBoxLabelPoint,
    label: 'POINT',
  },
  check: {
    icon: <CheckCircleIcon size={20} />,
    boxClass: styles.infoBoxCheck,
    labelClass: styles.infoBoxLabelCheck,
    label: 'CHECK',
  },
  caution: {
    icon: <AlertTriangleIcon size={20} />,
    boxClass: styles.infoBoxCaution,
    labelClass: styles.infoBoxLabelCaution,
    label: 'CAUTION',
  },
};

const characterConfig: Record<
  CharacterId,
  { name: string; avatar: string; style: string; bubble: string }
> = {
  juna: {
    name: 'JUNA（ジュナ）',
    avatar: '/assets/char-juna-avatar.webp',
    style: styles.chatRowJuna,
    bubble: styles.chatBubbleJuna,
  },
  rina: {
    name: '莉奈（りな）',
    avatar: '/assets/char-rina-avatar.webp',
    style: '',
    bubble: styles.chatBubbleRina,
  },
};

function HeroSection({ hero }: { hero: VisualArticleData['hero'] }) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroPattern} />
      <div className={styles.heroContent}>
        <div className={styles.heroCharacters}>
          <div className={styles.heroAvatar}>
            <img src={hero.characterImages.left} alt="JUNA" />
          </div>
          <img className={styles.heroCarIcon} src={hero.characterImages.center} alt="car" />
          <div className={styles.heroAvatar}>
            <img src={hero.characterImages.right} alt="莉奈" />
          </div>
        </div>
        <p className={styles.heroLessonNumber}>{hero.lessonNumber}</p>
        <h1 className={styles.heroTitle} style={{ whiteSpace: 'pre-line' as const }}>
          {hero.title}
        </h1>
        <p className={styles.heroDescription}>{hero.description}</p>
        <div className={styles.heroMeta}>
          <span className="flex items-center gap-1">
            <ClockIcon size={14} />
            {hero.readTime}
          </span>
          <span className={styles.heroMetaDivider}>|</span>
          <span>{hero.difficulty}</span>
          <span className={styles.heroMetaDivider}>|</span>
          <span className={styles.heroMetaCategory}>{hero.category}</span>
        </div>
      </div>
    </section>
  );
}

function ChatMessageBlock({ character, text }: { character: CharacterId; text: string }) {
  const cfg = characterConfig[character];
  const isJuna = character === 'juna';

  return (
    <div className={`${styles.chatRow} ${cfg.style}`}>
      <div className={`${styles.chatAvatar} ${isJuna ? styles.chatAvatarJuna : styles.chatAvatarRina}`}>
        <img src={cfg.avatar} alt={cfg.name} />
      </div>
      <div className={`${styles.chatBody} ${isJuna ? styles.chatBodyJuna : styles.chatBodyRina}`}>
        <span className={`${styles.chatNameTag} ${isJuna ? styles.chatNameTagJuna : styles.chatNameTagRina}`}>
          {cfg.name}
        </span>
        <div className={`${styles.chatBubble} ${cfg.bubble}`}>{text}</div>
      </div>
    </div>
  );
}

function BodyHeadingBlock({ level, text, accentColor }: { level: number; text: string; accentColor?: string }) {
  if (level === 4) {
    return <h4 className={styles.bodySubHeading} style={accentColor ? { color: accentColor } : undefined}>{text}</h4>;
  }
  return <h3 className={`${styles.bodyHeading} ${accentColor ? styles.bodyHeadingAccent : ''}`} style={accentColor ? { color: accentColor } : undefined}>{text}</h3>;
}

function IllustrationBlock({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <div className={styles.illustrationWrapper}>
      <img className={styles.illustrationImage} src={src} alt={alt} />
      <p className={styles.illustrationCaption}>{caption}</p>
    </div>
  );
}

function SystemCardBlock({ number, title, paragraphs, color, barColor, iconName }: { number: string; title: string; paragraphs: string[]; color: string; barColor: string; iconName: string }) {
  return (
    <div className={styles.systemCard}>
      <div className={styles.systemCardIcon} style={{ backgroundColor: getColorValue(barColor) }}>
        {systemIcons[iconName] || <span className="text-lg font-bold">{number}</span>}
      </div>
      <div className={styles.systemCardBody}>
        <span className={styles.systemCardNumber} style={{ color: getColorValue(color) }}>SYSTEM {number}</span>
        <h4 className={styles.systemCardTitle}>{title}</h4>
        {paragraphs.map((paragraph, index) => <p key={index} className={styles.systemCardParagraph}>{paragraph}</p>)}
      </div>
      <div className={`${styles.systemCardDot} ${styles.systemCardDotTop}`} style={{ backgroundColor: getColorValue(barColor) }} />
      <div className={`${styles.systemCardDot} ${styles.systemCardDotBottom}`} style={{ backgroundColor: getColorValue(barColor) }} />
    </div>
  );
}

function InfoBoxBlock({ boxType, title, content }: { boxType: InfoBoxType; title?: string; content: InfoBoxContent[] }) {
  const cfg = infoBoxConfig[boxType];
  return (
    <div className={`${styles.infoBox} ${cfg.boxClass}`}>
      <div className={styles.infoBoxHeader}>
        {cfg.icon}
        <span className={`${styles.infoBoxLabel} ${cfg.labelClass}`}>{cfg.label}</span>
        {title && <span className={styles.infoBoxTitle}>{title}</span>}
      </div>
      <div className={styles.infoBoxContent}>
        {content.map((item, index) => item.kind === 'paragraph'
          ? <p key={index} className={styles.infoBoxParagraph}>{item.text}</p>
          : <ul key={index} className={styles.infoBoxList}>{item.items.map((listItem, itemIndex) => <li key={itemIndex}>{listItem}</li>)}</ul>)}
      </div>
    </div>
  );
}

function DataTableBlock({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className={styles.tableWrapper}>
      <table>
        <thead><tr>{headers.map((header, index) => <th key={index}>{header}</th>)}</tr></thead>
        <tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function NumberedListBlock({ title, color, items }: { title: string; color: string; items: string[] }) {
  return (
    <div className={styles.numberedListCard}>
      <h4 className={styles.numberedListTitle} style={{ color: getColorValue(color) }}>{title}</h4>
      {items.map((item, index) => (
        <div key={index} className={styles.numberedListItem}>
          <div className={styles.numberedListNumber} style={{ backgroundColor: getColorValue(color) }}>
            <span className={styles.numberedListText} style={{ color: 'white', fontSize: '11px', fontWeight: 700 }}>{index + 1}</span>
          </div>
          <span className={styles.numberedListText}>{item}</span>
        </div>
      ))}
    </div>
  );
}

function CheckListBlock({ title, color, items }: { title: string; color: string; items: string[] }) {
  return (
    <div className={styles.checkListCard}>
      <h4 className={styles.checkListTitle}>{title}</h4>
      {items.map((item, index) => (
        <div key={index} className={styles.checkListItem}>
          <div className={styles.checkListNumber} style={{ backgroundColor: getColorValue(color) }}>
            <span className={styles.checkListNumberText}>{index + 1}</span>
          </div>
          <span className={styles.checkListText}>{item}</span>
        </div>
      ))}
    </div>
  );
}

function StepFlowBlock({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <div className={styles.illustrationWrapper}>
      <img className={styles.stepFlowImage} src={src} alt={alt} />
      <p className={styles.illustrationCaption}>{caption}</p>
    </div>
  );
}

function SummaryCardBlock({ title, paragraphs }: { title: string; paragraphs: string[] }) {
  return (
    <div className={styles.summaryCard}>
      <h4 className={styles.summaryCardTitle}>{title}</h4>
      {paragraphs.map((paragraph, index) => <p key={index} className={styles.summaryCardText}>{paragraph}</p>)}
    </div>
  );
}

function SectionHeader({ number, title, subtitle, accentColor }: { number: string; title: string; subtitle: string; accentColor: string }) {
  return (
    <div className={styles.sectionHeader} id={`section-${number}`}>
      <div className={styles.sectionDecorCircle} style={{ borderColor: 'rgba(255, 213, 79, 0.3)', width: 48, height: 48, top: 16, left: '10%' }} />
      <div className={styles.sectionDecorCircle} style={{ borderColor: 'rgba(232, 221, 208, 0.5)', width: 32, height: 32, top: 32, right: '15%' }} />
      <div className={styles.sectionNumber} style={{ color: accentColor }}>{number}</div>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <p className={styles.sectionSubtitle}>{subtitle}</p>
    </div>
  );
}

function renderBlock(block: ArticleBlock, index: number): ReactNode {
  switch (block.type) {
    case 'chat':
      return <ChatMessageBlock key={index} character={block.character} text={block.text} />;
    case 'paragraph':
      return <p key={index} className={styles.bodyParagraph}>{block.text}</p>;
    case 'heading':
      return <BodyHeadingBlock key={index} level={block.level} text={block.text} accentColor={block.accentColor} />;
    case 'illustration':
      return <IllustrationBlock key={index} src={block.src} alt={block.alt} caption={block.caption} />;
    case 'systemCard':
      return <SystemCardBlock key={index} number={block.number} title={block.title} paragraphs={block.paragraphs} color={block.color} barColor={block.barColor} iconName={block.iconName} />;
    case 'infoBox':
      return <InfoBoxBlock key={index} boxType={block.boxType} title={block.title} content={block.content} />;
    case 'table':
      return <DataTableBlock key={index} headers={block.headers} rows={block.rows} />;
    case 'checkList':
      return <CheckListBlock key={index} title={block.title} color={block.color} items={block.items} />;
    case 'numberedList':
      return <NumberedListBlock key={index} title={block.title} color={block.color} items={block.items} />;
    case 'stepFlow':
      return <StepFlowBlock key={index} src={block.src} alt={block.alt} caption={block.caption} />;
    case 'summary':
      return <SummaryCardBlock key={index} title={block.title} paragraphs={block.paragraphs} />;
    case 'spacer':
      return <div key={index} className={block.size === 'sm' ? styles.spacerSm : block.size === 'lg' ? styles.spacerLg : styles.spacerMd} />;
    default:
      return null;
  }
}

interface VisualJsonArticlePageProps {
  data: VisualArticleData;
}

export default function VisualJsonArticlePage({ data }: VisualJsonArticlePageProps) {
  const sections = useMemo(() => data.sections, [data.sections]);
  const closingBlocks = useMemo(() => data.closingBlocks, [data.closingBlocks]);

  return (
    <article className={styles.article}>
      <HeroSection hero={data.hero} />
      {sections.map((section) => (
        <section key={section.id} className={styles.section} id={section.id}>
          {section.sectionNumber && <SectionHeader number={section.sectionNumber} title={section.title} subtitle={section.subtitle} accentColor={section.accentColor} />}
          <div className={styles.container}>{section.blocks.map((block, index) => renderBlock(block, index))}</div>
        </section>
      ))}
      <section className={styles.container}>{closingBlocks.map((block, index) => renderBlock(block, index))}</section>
      <div className={styles.spacerLg} />
    </article>
  );
}

function getColorValue(twClass: string): string {
  const map: Record<string, string> = {
    'text-ch-orange': '#FF8C42',
    'text-ch-pink': '#F06292',
    'text-ch-blue': '#42A5F5',
    'text-ch-yellow': '#FFCA28',
    'bg-orange-400': '#FF8C42',
    'bg-pink-400': '#F06292',
    'bg-blue-400': '#42A5F5',
    'bg-yellow-400': '#FFCA28',
  };
  return map[twClass] || twClass;
}
