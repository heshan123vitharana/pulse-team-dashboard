import { marked, Renderer } from "marked";
import "./styles.css"

interface MarkdownRendererProps {
    content: string;
}

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
    const renderer = new Renderer()

    renderer.link = (i) => {
        return `<span><a href="${i.href}" target="_blank">${i.text} </a></span>`
    }

    const createMarkup = () => {
        return { __html: marked(content, { renderer }) }
    };

    return (
        <div
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={createMarkup() as any}
        />
    );
};
