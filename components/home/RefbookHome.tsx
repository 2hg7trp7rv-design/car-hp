"use client";

import { useEffect } from "react";

import { RINA_IMG, SHUNA_IMG } from "./refbookImages";

const CSS = `
.rb-root{
  --rb-bg:#fffdf8;--rb-ink:#2b2b33;--rb-ink-soft:#6b6b76;
  --rb-shuna:#ff8fa8;--rb-shuna-soft:#ffe9ee;
  --rb-rina:#4a6fa5;--rb-rina-soft:#e8f0fa;
  --rb-accent:#ffb340;--rb-line:#efe9df;--rb-radius:24px;
  background:var(--rb-bg);color:var(--rb-ink);
  font-family:'Noto Sans JP',sans-serif;line-height:1.9;
  overflow-x:hidden;min-height:100vh;
}
.rb-root *{margin:0;padding:0;box-sizing:border-box}
.rb-root h1,.rb-root h2,.rb-root h3,.rb-root h4{font-family:'M PLUS Rounded 1c',sans-serif}
.rb-root ::selection{background:var(--rb-shuna);color:#fff}
.rb-root img{max-width:none}

.rb-header{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;justify-content:space-between;align-items:center;
  padding:16px 32px;
  background:rgba(255,253,248,.9);backdrop-filter:blur(10px);
  border-bottom:2px solid var(--rb-line);
}
.rb-logo{
  font-family:'M PLUS Rounded 1c',sans-serif;font-weight:800;
  font-size:15px;letter-spacing:.12em;color:var(--rb-ink);text-decoration:none;
  display:flex;align-items:center;gap:10px;
}
.rb-logo-badge{
  background:var(--rb-ink);color:#fff;font-size:10px;
  padding:3px 10px;border-radius:99px;letter-spacing:.15em;
}
.rb-nav{display:flex;gap:8px}
.rb-nav a{
  font-size:13px;font-weight:700;color:var(--rb-ink-soft);text-decoration:none;
  padding:8px 16px;border-radius:99px;transition:.3s;
}
.rb-nav a:hover{background:var(--rb-shuna-soft);color:var(--rb-shuna)}

.rb-hero{
  min-height:100vh;
  display:flex;flex-direction:column;justify-content:center;align-items:center;
  text-align:center;padding:140px 24px 80px;position:relative;
  background:
    radial-gradient(circle at 15% 20%,var(--rb-shuna-soft) 0%,transparent 40%),
    radial-gradient(circle at 85% 80%,var(--rb-rina-soft) 0%,transparent 40%);
}
.rb-hero-badge{
  display:inline-block;background:#fff;border:2px solid var(--rb-ink);
  border-radius:99px;padding:8px 24px;
  font-family:'M PLUS Rounded 1c';font-weight:800;font-size:13px;letter-spacing:.1em;
  box-shadow:4px 4px 0 var(--rb-ink);margin-bottom:32px;
}
.rb-hero h1{font-size:clamp(30px,5.4vw,58px);font-weight:800;line-height:1.5;margin-bottom:24px}
.rb-hero h1 .rb-hl-pink{background:linear-gradient(transparent 62%,var(--rb-shuna-soft) 62%);padding:0 .15em}
.rb-hero h1 .rb-hl-blue{background:linear-gradient(transparent 62%,var(--rb-rina-soft) 62%);padding:0 .15em}
.rb-hero .rb-lead{color:var(--rb-ink-soft);font-size:15px;max-width:600px;margin:0 auto 48px}
.rb-hero-chars{display:flex;justify-content:center;align-items:flex-end;gap:0;margin-bottom:-8px}
.rb-hero-chars img{width:clamp(150px,22vw,260px);filter:drop-shadow(0 12px 24px rgba(43,43,51,.14))}
.rb-hero-chars img:last-child{margin-left:-40px}
.rb-hero-cta{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:32px}
.rb-btn{
  font-family:'M PLUS Rounded 1c';font-weight:800;font-size:15px;
  text-decoration:none;padding:16px 36px;border-radius:99px;
  transition:transform .2s,box-shadow .2s;border:2px solid var(--rb-ink);
}
.rb-btn:hover{transform:translateY(-3px)}
.rb-btn-pink{background:var(--rb-shuna);color:#fff;box-shadow:5px 5px 0 var(--rb-ink)}
.rb-btn-pink:hover{box-shadow:7px 7px 0 var(--rb-ink)}
.rb-btn-white{background:#fff;color:var(--rb-ink);box-shadow:5px 5px 0 var(--rb-line)}
.rb-btn-white:hover{box-shadow:7px 7px 0 var(--rb-line)}

.rb-block{max-width:1080px;margin:0 auto;padding:100px 24px}
.rb-sec-head{text-align:center;margin-bottom:64px}
.rb-sec-kicker{
  display:inline-block;font-family:'M PLUS Rounded 1c';font-weight:800;font-size:12px;
  letter-spacing:.2em;padding:6px 18px;border-radius:99px;margin-bottom:16px;
}
.rb-sec-head h2{font-size:clamp(26px,3.6vw,40px);font-weight:800;line-height:1.5;text-wrap:balance}
.rb-nobr{display:inline-block}
.rb-sec-head p{color:var(--rb-ink-soft);font-size:14px;margin-top:12px}

.rb-path{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
.rb-path-card{
  background:#fff;border:2px solid var(--rb-line);border-radius:var(--rb-radius);
  padding:40px 32px;position:relative;transition:.3s;
}
.rb-path-card:hover{transform:translateY(-6px);border-color:var(--rb-ink);box-shadow:8px 8px 0 var(--rb-line)}
.rb-path-num{font-family:'M PLUS Rounded 1c';font-weight:800;font-size:44px;line-height:1;margin-bottom:20px}
.rb-path-card h3{font-size:20px;font-weight:800;margin-bottom:12px}
.rb-path-card p{font-size:13px;color:var(--rb-ink-soft)}
.rb-path-arrow{position:absolute;top:44px;right:-28px;z-index:2;font-size:24px;color:var(--rb-accent)}
.rb-p1 .rb-path-num{color:var(--rb-shuna)}
.rb-p2 .rb-path-num{color:var(--rb-rina)}
.rb-p3 .rb-path-num{color:var(--rb-accent)}

.rb-topics{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
.rb-topic{
  position:relative;background:#fff;border:2px solid var(--rb-line);
  border-radius:var(--rb-radius);padding:40px 32px 32px;
  text-decoration:none;color:var(--rb-ink);transition:.3s;
  display:flex;flex-direction:column;overflow:hidden;
}
.rb-topic:hover{transform:translateY(-6px);box-shadow:8px 8px 0 var(--rb-line);border-color:var(--rb-ink)}
.rb-topic::before{content:'';position:absolute;top:0;left:0;right:0;height:8px}
.rb-t-pink::before{background:var(--rb-shuna)}
.rb-t-blue::before{background:var(--rb-rina)}
.rb-t-yellow::before{background:var(--rb-accent)}
.rb-t-green::before{background:#7bc98f}
.rb-t-purple::before{background:#b48fd9}
.rb-t-orange::before{background:#ff9e6b}
.rb-t-pink .rb-topic-icon{background:var(--rb-shuna-soft);border-color:#ffd3de}
.rb-t-blue .rb-topic-icon{background:var(--rb-rina-soft);border-color:#c9dcf2}
.rb-t-yellow .rb-topic-icon{background:#fff3d9;border-color:#ffe0a8}
.rb-t-green .rb-topic-icon{background:#e6f5ea;border-color:#c4e6cf}
.rb-t-purple .rb-topic-icon{background:#f2eafa;border-color:#ddc9f0}
.rb-t-orange .rb-topic-icon{background:#ffeee5;border-color:#ffd4bd}
.rb-topic-icon{
  width:64px;height:64px;border-radius:18px;font-size:30px;
  display:flex;align-items:center;justify-content:center;margin-bottom:20px;
  background:var(--rb-bg);border:2px solid var(--rb-line);
}
.rb-topic h3{font-size:20px;font-weight:800;margin-bottom:8px}
.rb-topic p{font-size:12px;color:var(--rb-ink-soft);margin-bottom:20px;flex:1}
.rb-topic-meta{display:flex;justify-content:space-between;align-items:center;border-top:2px solid var(--rb-line);padding-top:16px}
.rb-topic-count{font-family:'M PLUS Rounded 1c';font-weight:800;font-size:12px;color:var(--rb-ink-soft)}
.rb-badge-open{font-family:'M PLUS Rounded 1c';font-weight:800;font-size:11px;background:var(--rb-shuna-soft);color:var(--rb-shuna);padding:5px 14px;border-radius:99px}
.rb-badge-soon{font-family:'M PLUS Rounded 1c';font-weight:800;font-size:11px;background:var(--rb-line);color:var(--rb-ink-soft);padding:5px 14px;border-radius:99px}
.rb-topic.rb-soon{opacity:.75}
.rb-topic.rb-soon:hover{transform:none;box-shadow:none;border-color:var(--rb-line)}

.rb-chars-intro{display:grid;grid-template-columns:1fr 1fr;gap:28px}
.rb-char-card{border-radius:var(--rb-radius);padding:44px 36px;position:relative;overflow:hidden;border:2px solid var(--rb-ink)}
.rb-char-card.rb-s{background:var(--rb-shuna-soft)}
.rb-char-card.rb-r{background:var(--rb-rina-soft)}
.rb-char-card img{position:absolute;right:-20px;bottom:-10px;width:180px}
.rb-char-card h3{font-size:22px;font-weight:800;margin-bottom:6px}
.rb-char-role{display:inline-block;font-size:11px;font-weight:700;background:#fff;border-radius:99px;padding:4px 14px;margin-bottom:16px}
.rb-char-card p{font-size:13px;color:var(--rb-ink);max-width:55%;position:relative;z-index:2}

.rb-footer{background:var(--rb-ink);color:#fff;padding:80px 24px 40px;text-align:center}
.rb-footer .rb-f-logo{font-family:'M PLUS Rounded 1c';font-weight:800;font-size:20px;letter-spacing:.1em;margin-bottom:16px}
.rb-footer nav{margin:32px 0;display:flex;justify-content:center;gap:24px;flex-wrap:wrap}
.rb-footer nav a{color:#bdbdc6;font-size:13px;text-decoration:none}
.rb-footer nav a:hover{color:var(--rb-shuna)}
.rb-footer small{color:#7a7a85;font-size:11px}

.rb-reveal{opacity:0;transform:translateY(36px);transition:opacity .9s,transform .9s cubic-bezier(.16,1,.3,1)}
.rb-reveal.rb-in{opacity:1;transform:none}

@media(max-width:860px){
  .rb-nav{display:none}
  .rb-hero{min-height:auto;padding:110px 20px 64px}
  .rb-hero .rb-lead{font-size:13px}
  .rb-hero-chars img{width:clamp(130px,34vw,180px)}
  .rb-hero-chars img:last-child{margin-left:-24px}
  .rb-hero-cta{margin-top:28px}
  .rb-btn{padding:15px 28px;font-size:14px}
  .rb-block{padding:72px 20px}
  .rb-sec-head{margin-bottom:44px}
  .rb-path,.rb-chars-intro,.rb-topics{grid-template-columns:1fr}
  .rb-path-arrow{display:none}
  .rb-char-card{padding:32px 24px}
  .rb-char-card p{max-width:62%;font-size:12px}
  .rb-char-card img{width:110px;right:-14px}
}
`;

export default function RefbookHome() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("rb-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.1 },
    );
    document.querySelectorAll(".rb-reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="rb-root">
      <style>{CSS}</style>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700;800&family=Noto+Sans+JP:wght@400;500;700&display=swap"
      />

      <header className="rb-header">
        <a className="rb-logo" href="/">
          CAR BOUTIQUE JOURNAL <span className="rb-logo-badge">参考書</span>
        </a>
        <nav className="rb-nav">
          <a href="#path">学び方</a>
          <a href="#topics">トピック一覧</a>
          <a href="#chars">キャラクター</a>
        </nav>
      </header>

      <section className="rb-hero">
        <span className="rb-hero-badge">📖 車の宇宙一わかりやすい参考書</span>
        <h1>
          <span className="rb-nobr">車の</span>
          <span className="rb-hl-pink rb-nobr">「なんで？」</span>
          <span className="rb-nobr">に、</span>
          <br />
          <span className="rb-nobr">二人と一緒に</span>
          <br />
          <span className="rb-hl-blue rb-nobr">0から1</span>
          <span className="rb-nobr">で答える。</span>
        </h1>
        <p className="rb-lead">
          CAR BOUTIQUE JOURNALは、<span className="rb-nobr">部品の名前も知らない</span>
          <span className="rb-nobr">初学者から、</span>
          <span className="rb-nobr">もっと深く知りたい</span>
          <span className="rb-nobr">マスター候補まで。</span>
          <span className="rb-nobr">絵と図と例え話で、</span>
          <span className="rb-nobr">車の「なぜ？」が</span>
          <span className="rb-nobr">「なるほど！」に変わる</span>
          <span className="rb-nobr">自動車メディアです。</span>
        </p>
        <div className="rb-hero-chars">
          <img src={SHUNA_IMG} alt="シュナ" />
          <img src={RINA_IMG} alt="莉奈" />
        </div>
        <div className="rb-hero-cta">
          <a className="rb-btn rb-btn-pink" href="#topics">
            トピックを選ぶ →
          </a>
          <a className="rb-btn rb-btn-white" href="#path">
            学び方を見る
          </a>
        </div>
      </section>

      <section className="rb-block rb-reveal" id="path">
        <div className="rb-sec-head">
          <span
            className="rb-sec-kicker"
            style={{ background: "var(--rb-shuna-soft)", color: "var(--rb-shuna)" }}
          >
            HOW TO LEARN
          </span>
          <h2>このサイトの「階段」の登り方</h2>
          <p>
            <span className="rb-nobr">どの記事も、基礎→実践→発展の3ステップ。</span>
            <span className="rb-nobr">気づけば難しい話まで読めてる。</span>
          </p>
        </div>
        <div className="rb-path">
          <div className="rb-path-card rb-p1">
            <div className="rb-path-num">01</div>
            <h3>まず「それ何？」から</h3>
            <p>部品の名前も知らなくてOK。「これって何？」という素朴な疑問から、絵と例え話でイメージを掴む。</p>
            <span className="rb-path-arrow">→</span>
          </div>
          <div className="rb-path-card rb-p2">
            <div className="rb-path-num">02</div>
            <h3>仕組みを図で理解</h3>
            <p>断面図と比較表で「なぜそうなるか」を構造から理解。丸暗記じゃなく、理屈で覚える。</p>
            <span className="rb-path-arrow">→</span>
          </div>
          <div className="rb-path-card rb-p3">
            <div className="rb-path-num">03</div>
            <h3>発展で「裏側」へ</h3>
            <p>「なんでこうなるの？」の一歩先。一見矛盾に見える制度や仕組みの裏側まで一直線。</p>
          </div>
        </div>
      </section>

      <section className="rb-block rb-reveal" id="topics">
        <div className="rb-sec-head">
          <span
            className="rb-sec-kicker"
            style={{ background: "var(--rb-rina-soft)", color: "var(--rb-rina)" }}
          >
            TOPICS
          </span>
          <h2>
            <span className="rb-nobr">トピックを選んで、</span>
            <span className="rb-nobr">学び始めよう</span>
          </h2>
          <p>各トピックの中に「基礎→発展」のレッスンが並んでいるよ。まずは気になる所から。</p>
        </div>
        <div className="rb-topics">
          <a className="rb-topic rb-t-pink" href="/guide">
            <div className="rb-topic-icon">🔧</div>
            <h3>排気系・マフラー</h3>
            <p>マフラーとは？から「静かなのに車検に落ちる謎」まで。排気ガスの旅を追いかける。</p>
            <div className="rb-topic-meta">
              <span className="rb-topic-count">全2レッスン</span>
              <span className="rb-badge-open">公開中</span>
            </div>
          </a>
          <a className="rb-topic rb-t-blue rb-soon" href="#">
            <div className="rb-topic-icon">💨</div>
            <h3>ターボ・過給機</h3>
            <p>「空気を詰め込むと、なぜ速くなる？」NAとターボの維持費逆転の法則まで。</p>
            <div className="rb-topic-meta">
              <span className="rb-topic-count">全2レッスン</span>
              <span className="rb-badge-soon">準備中</span>
            </div>
          </a>
          <a className="rb-topic rb-t-yellow rb-soon" href="#">
            <div className="rb-topic-icon">🛞</div>
            <h3>足回り・サスペンション</h3>
            <p>乗り心地と走りを決める足回り。車高調とダウンサス、何が違うの？</p>
            <div className="rb-topic-meta">
              <span className="rb-topic-count">全2レッスン</span>
              <span className="rb-badge-soon">準備中</span>
            </div>
          </a>
          <a className="rb-topic rb-t-green rb-soon" href="#">
            <div className="rb-topic-icon">🔋</div>
            <h3>エンジンの基礎</h3>
            <p>エンジンって何してるの？4ストロークから直噴・ハイブリッドの違いまで。</p>
            <div className="rb-topic-meta">
              <span className="rb-topic-count">全2レッスン</span>
              <span className="rb-badge-soon">準備中</span>
            </div>
          </a>
          <a className="rb-topic rb-t-purple rb-soon" href="#">
            <div className="rb-topic-icon">📋</div>
            <h3>車検・制度</h3>
            <p>車検は何を見てるの？保安基準、改造と法律の境界線を正しく理解する。</p>
            <div className="rb-topic-meta">
              <span className="rb-topic-count">全2レッスン</span>
              <span className="rb-badge-soon">準備中</span>
            </div>
          </a>
          <a className="rb-topic rb-t-orange rb-soon" href="#">
            <div className="rb-topic-icon">💰</div>
            <h3>維持費・お金</h3>
            <p>車の本当のコスト。税金、保険、燃料、整備——「乗り続ける」の値段。</p>
            <div className="rb-topic-meta">
              <span className="rb-topic-count">全2レッスン</span>
              <span className="rb-badge-soon">準備中</span>
            </div>
          </a>
        </div>
      </section>

      <section className="rb-block rb-reveal" id="chars">
        <div className="rb-sec-head">
          <span
            className="rb-sec-kicker"
            style={{ background: "#fff3d9", color: "var(--rb-accent)" }}
          >
            TEACHERS
          </span>
          <h2>案内人はこの二人</h2>
        </div>
        <div className="rb-chars-intro">
          <div className="rb-char-card rb-s">
            <h3>シュナ</h3>
            <span className="rb-char-role">初学者・読者の代弁者</span>
            <p>金髪ギャル。車の知識はゼロだけど「なんで？」が止まらない。みんなが聞きづらい素朴な疑問を、全力で莉奈にぶつける。</p>
            <img src={SHUNA_IMG} alt="シュナ" />
          </div>
          <div className="rb-char-card rb-r">
            <h3>莉奈</h3>
            <span className="rb-char-role">マスター・解説者</span>
            <p>黒髪お姉さん。整備から車検制度まで熟知するマスター。難しい話を図と例え話に翻訳するのが大得意。</p>
            <img src={RINA_IMG} alt="莉奈" />
          </div>
        </div>
      </section>

      <footer className="rb-footer">
        <div className="rb-f-logo">CAR BOUTIQUE JOURNAL</div>
        <p style={{ color: "#bdbdc6", fontSize: "13px" }}>車の宇宙一わかりやすい参考書</p>
        <nav>
          <a href="#topics">トピック一覧</a>
          <a href="#chars">キャラクター</a>
          <a href="/legal/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/legal/privacy">Privacy</a>
        </nav>
        <small>© 2026 CAR BOUTIQUE JOURNAL</small>
      </footer>
    </div>
  );
}
