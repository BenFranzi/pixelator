import {FunctionalComponent, h} from 'preact';
import style from './style.css';
import {useRef, useEffect, MutableRef, useState} from 'preact/hooks';
import convertToBoxShadow, {fileToImage, urlToImage} from "../../utils/convert-to-box-shadow";

const Home: FunctionalComponent = () => {
  const [copyTextTimeoutId, setCopyTextTimeoutId] = useState<number|null>(null);

  const [image, setImage] = useState<HTMLImageElement>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pixelsPerPixel, setPixelsPerPixel] = useState<number>(8);
  const editorRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);
  const isSliding = useRef(false);

  async function initial(): Promise<void> {
    const loaded = await urlToImage('assets/lorikeet.jpg');
    setImage(loaded);
  }

  useEffect(() => {
    initial();
  }, [])


  async function convert(): Promise<void> {
    if (!image) {
      return;
    }

    const {boxShadow, origin, width} = await convertToBoxShadow(image, pixelsPerPixel);

    destinationRef.current?.style?.setProperty("background", origin);
    destinationRef.current?.style?.setProperty("font-size", `calc(100vw / ${width})`);
    destinationRef.current?.style?.setProperty("box-shadow", boxShadow);
    setIsLoading(false);
  }

  useEffect(() => {
    if (image) {
      convert();
    }
  }, [image, pixelsPerPixel]);

  const setSlider = (value: number) => {
    editorRef.current?.style?.setProperty('--slide', `${value}px`);
  }

  const moveSlider = (event: MouseEvent) => {
    // @ts-ignore
    if (!isSliding.current || sliderRef.current === event.target ||  controlsRef.current === event.target || controlsRef?.current?.contains(event.target)) {
      return;
    }
    event.preventDefault();
    setSlider(event.offsetX);
  };

  const moveSliderTouch = (event: TouchEvent) => {
    // @ts-ignore
    if (controlsRef.current === event.target || controlsRef?.current?.contains(event.target)) {
      return;
    }

    event.preventDefault();
    setSlider(event.targetTouches[0].clientX);
  };

  const onDrag = (event: any) => {
    event.preventDefault();
  }

  const onDrop = async (event: any) => {
    event.preventDefault();
    setIsLoading(true);
    setImage(await fileToImage(event.dataTransfer.items[0].getAsFile()));
    convert();
  }

  const onFile = async (event: any) => {
    setIsLoading(true);
    setImage(await fileToImage(event.target.files[0]));
    convert();
  }

  const onCopy = async () => {
    if (copyTextTimeoutId) {
      clearTimeout(copyTextTimeoutId);
    }

    const resets = `<style>body { margin: 0 }</style>`;

    await navigator.clipboard.writeText(`${resets}${destinationRef.current?.outerHTML}`);

    setCopyTextTimeoutId(
      // @ts-ignore
      setTimeout(() => setCopyTextTimeoutId(null), 1000),
    );
  }

  return (
    <div
      class={style.editor}
      ref={editorRef}
      onMouseMove={moveSlider}
      onTouchMove={moveSliderTouch}
      onDrop={onDrop}
      onDragOver={onDrag}
    >
      <img src={image?.src} class={style.left} alt=""/>
      <div class={style.right}>
        <div ref={destinationRef} style={{
          width: '1em',
          height: '1em',
        }}/>
      </div>
      <div
        class={style.slider}
        ref={sliderRef}
        onMouseDown={() => isSliding.current = true}
        onTouchStart={() => isSliding.current = true}
        onMouseUp={() => isSliding.current = false}
        onTouchEnd={() => isSliding.current = false}
      />
      <div class={style.controls} ref={controlsRef}>
        <div><label>pixels per pixel</label>

          <input
            type="range"
            step="1"
            min="1"
            max="64"
            value={pixelsPerPixel}
            onChange={(event: any) => {
              setIsLoading(true);
              event.stopPropagation();
              setPixelsPerPixel(event?.target?.value || 8);
            }}
          /></div>
        <div>
          <label>upload image</label>
          <input
            type="file"
            value={undefined}
            onChange={onFile}
          />
          <p>{isLoading && 'Loading...'}</p>
        </div>
        <button onClick={onCopy}>{copyTextTimeoutId ? 'copied!' : 'copy'}</button>
      </div>
    </div>
  );
};

export default Home;
