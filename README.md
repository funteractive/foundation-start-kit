# 本ガイドラインについて
このガイドラインは、ファンタラクティブ株式会社がWebサイト制作を行う際のルールを定めたものです。
新規Webサイト制作や、既存ページの修正・更新におけるクオリティー・メンテナンスの向上を目的としています。

***

# 制作にあたって
バージョン管理システム、CSSプリプロセッサー、タスクランナーを使用する。
必要なモジュール/ソフトは以下に記載。予め、homebrew等でインストールしておくこと。

- node.js
- ruby
- git
- grunt/gulp
- jade
- Sass 3.3
- Compass 1.0.0.alpha

***

# テンプレートセット

bitbucket上にあるスタートテンプレートセットをcloneして使用する
~~~~
# clone
git clone https://USERID@bitbucket.org/funteractive/foundation-start.git
~~~~

パッケージインストール
~~~~
# npm
npm install
~~~~

gruntスタート
~~~~
# bower install
grunt build
# grunt watch
grunt
~~~~

***

# 仕様

1. HTML5
2. CSS 2.2〜
3. Windows 7〜/ Mac OSX
4. Internet Explorer 9 ~ / Firefox / Google Chrome / Safari

***

# ディレクトリ構成

~~~~
.
└── foundation-start
    ├── Gruntfile.js
    ├── bower.json
    ├── config.rb
    ├── doc
    ├── package.json
    ├── setting.json
    └── shared
        ├── img
        │   ├── page
        │   ├── site
        │   └── sprite
        ├── jade
        │   ├── inc
        │   │   ├── core
        │   │   │   ├── _base_legacy.jade
        │   │   │   ├── _config.jade
        │   │   │   └── _mixin.jade
        │   │   ├── layout
        │   │   │   ├── _footer.jade
        │   │   │   └── _header.jade
        │   │   └── module
        │   │       └── _sns.jade
        │   └── index.jade
        ├── js
        │   ├── lib
        │   ├── app
        │   │   └── script.js
        │   ├── lib.min.js
        │   └── script.min.js
        └── scss
            ├── core
            │   ├── _config.scss
            │   ├── _default.scss
            │   ├── _foundation.scss
            │   ├── _functions.scss
            │   ├── _mixins.scss
            │   └── _settings.scss
            ├── layout
            │   ├── _footer.scss
            │   ├── _header.scss
            │   └── _layout.scss
            ├── module
            │   ├── _buttons.scss
            │   ├── _icons.scss
            │   ├── _grid.scss
            │   └── _helper.scss
            └── style.scss
~~~~

***

# ファイル名の命名規則

HTMLファイル、ディレクトリ、画像ファイル及びCSS（ID及びCLASSセレクタ）の名前の付け方は以下を基本ルールとする。

- 英数字のみを使用。
- 機種依存文字の使用禁止。
- 必ずアルファベットからはじめ数字からはじめてはいけない。
- 全角スペース、半角スペース（Space）の使用禁止。
- 「\」,「/」,「*」,「:」,「?」,「<」,「>」,「|」,「＄」これらの文字の使用禁止。
- インデントは、各言語フォーマットに従う。ただし、通常は「半角スペース2つ」とする。

## 画像

画像ファイルにおける命名規則は「種類」と「個性」を「_」アンダーバーでつなげる。

例 img_company.jpg

| 種類       | 個性        |
|:-----------|:------------|
|img|company|

### 種類の規則
「種類」は種別の判断が出来る英単語を使用する。
単語が複数ある場合はキャメルケースで繋げる。

| 種類       | 説明        |
|:-----------|:------------|
|img|画像・写真|
|ttl|タイトル|
|txt|テキスト|
|icon|アイコン|
|btn|ボタン要素|
|bg|背景|

### 個性の規則
「個性」も「種類」と同じくそれ自体を判断が出来る英単語を使用する。
単語が複数ある場合はキャメルケースで繋げる。

# HTML

- HTMLタグは必ず小文字で記述する。
- 終了タグは必ず記述する。
- Alt属性は必ず記述する。適切な文言がない場合はNull値とします。
- HTMLファイル内では基本的にHTMLのみのマークアップ行い、視覚表現（装飾やアニメーション）は外部ファイル化したCSS、JavaScriptで行う。
- スタイル目的のIDセレクタは使用しないこと。
- CLASSセレクタの命名規則においては、レイアウト要素については、接頭詞「l-」を使用する。また、ブロック要素に対してはBEM記法を用いること。

参考例

~~~
<div class="l-container">
  <header class="l-header">
    <h1 class="logo">Site</h1>
  </header>
  <div class="block">
    <h2 class="block__title">Title</h2>
    <div class="block__description">
      <p>Description</p>
    </div>
  </div>
  <footer class="l-footer">
    <p class="copyright"><small>Copyright &copy; All Rights Reserved.</small></p>
  </footer>
</div>
~~~	

# BEM

BEMとは、Block、Element、Modifierの略語
CLASSセレクタの命名規則においては、BEMの命名規則を用いること。

![BEM](http://img-fotki.yandex.ru/get/9347/221798411.0/0_babd8_4e505a88_XXL.png)

> <a href="http://bem.info/method/definitions/">Definitions / Methodology / BEM. Block, Element, Modifier / BEM</a>

BEMにおいて例外処理として下記に指定するルールを適用する

## Element

- Elementは1つまでとする
Elementの階層が深くなるとその分セレクタ名称も長くなるため、可読性及びメンテナンス性が失われるため。

- クラス名がなくてもセレクターで文脈が固定できる場合、要素構造的にそれ以外ありえない場合などは、Elementにおけるクラス名振り分けは省略できるものとする
あるブロック要素内に、例えば「li」要素しか使わないのが決まっているのであれば、クラスを振る必要はないものとする。

- 単語区切りは「-」を利用せず、キャメルケースで繋げること

### 主なElement使用単語一覧

| 単語       | 説明        |
|:-----------|:------------|
| wrap       | block要素を囲む場合など、外側のコンテナ |
| inner      | wrapに対する内側のコンテナ |
| block      | コンテンツを内包するブロック |
| slider     | スライドコンテンツ |
| next       | 次へナビゲーション |
| prev       | 前へナビゲーション |
| tab        | タブメニュー |
| nav        | ナビゲーション・メニュー |
| list       | リスト |
| item       | 子要素 |
| heading    | 見出しを内包する要素 |
| title      | タイトル |
| subTitle   | サブタイトル |
| description| コンテンツ説明本文 |
| caption    | 画像に対する説明 |
| summary    | コンテンツの概要 |
| note       | コンテンツの補足 |
| text       | 一つの文章 |
| thumb      | コンテンツのサムネイル |
| image      | サムネイル以外の画像要素 |
| banner     | 主にリンクに使用される画像要素 |


# Jade

- ファイル間で共通で使用するデータは、setting.jsonでまとめる。


# Sass（SCSS）

- SassはSCSS記法で記述する。
- IDセレクタを使用せず、CLASSセレクタを使用すること。
- 「&」を含んだセレクタで指定する

SCSS

~~~~
.foo{
  background-color: #f1f1f1;
  &__bar{
    color: #333;
  }
}
~~~~

CSS

~~~~
.foo{
  background-color: #f1f1f1;
}
.foo__bar{
  color: #333;
}
~~~~

以下はmixinの使用例

## sprite

1. img/sprite以下にpngファイルを配置する。
2. ファイルの横、縦サイズは必ず偶数値にする。

### 通常使用
spriteフォルダに配置した画像ファイル名を指定する

~~~~
@include sprite-ir($name);
~~~~

### モバイル対応
Retina対応、引数にmobileを指定する。

~~~~
@include sprite-ir($name,$mobile:true);
~~~~

###  その他

| 引数       | 説明        |
|:-----------|:------------|
| $name      | ファイル名（拡張子除く）を指定 |
| $spDir     | sprite-map |
| $spUrl     | sprite-url |
| $inline    | display:inline; |
| $hover     | ファイル名_onの画像をhoverで表示 |
| $center    | センター寄せ |
| $posX      | background-position X軸（px） |
| $posY      | background-position Y軸（px） |
| $mobile    | Retina対応 |
| $parent    | extend使用 |
| $display   | display:block; 非表示 |

## JavaScript

JavaScriptは動的な表現が必要な際と、外部APIなどを利用した際に使用する。

- jQueryを使用する場合は、対応ブラウザによって読み込むバージョンに注意すること。
- jQueryのバージョンは、IE8対応の場合は「1.8.2」とする。
- オリジナルコードは、「js/app/script.js」に記載する。
- ライブラリは、特に問題がなければ、bowerからインストールする。「bower.json」をプロジェクトごとに最適化すること。
- ライブラリは、表示速度のパフォーマンスを考慮して、「js/lib/」以下に配置することで、タスクランナーで1ファイル化される。ただし、ライブラリによってはコンフリクトするため、その場合は別ファイル読み込みとする。


策定　2014年7月30日
