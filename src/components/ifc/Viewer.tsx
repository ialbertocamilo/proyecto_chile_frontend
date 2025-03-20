"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Card from "../common/Card";

const loadIFCViewer = async () => {
    const { default: IFCViewer } = await import("@bytestone/ifc-component");
    return IFCViewer;
};

export default function IFCViewerComponent() {
    const [viewerInstance, setViewerInstance] = useState<any>(null);

    useEffect(() => {
        loadIFCViewer().then((IFCViewer) => {
            setViewerInstance(new IFCViewer({ canvasId: "myCanvas" }));
        });
    }, []);

    return (
        <Card>

<div className="viewer-container">
            <div id="treeViewContainer" ></div>
            <div id="canvasContainer">
                <canvas id="myCanvas" />
            </div>
            <style jsx>{`
                .viewer-container {
                    display: flex;
                    width: 100%;
                    height: 100dvh;
                }

                #treeViewContainer {
                    width: 350px;
                    height: 100dvh;
                    overflow-y: auto;
                    overflow-x: hidden;
                    background-color: rgba(255, 255, 255, 0.95);
                    padding: 10px;
                    border-right: 1px solid #dee2e6;
                    flex-shrink: 0;
                }

                #canvasContainer {
                    flex: 1;
                    height: 100dvh;
                    position: relative;
                }

                #myCanvas {
                    width: 100%;
                    height: 100%;
                }

                @media (max-width: 768px) {
                    .viewer-container {
                        flex-direction: column;
                    }

                    #treeViewContainer {
                        width: 100%;
                        height: 40dvh;
                        border-right: none;
                        border-bottom: 1px solid #dee2e6;
                    }

                    #canvasContainer {
                        height: 60dvh;
                    }
                }

                body {
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                }

                .container {
                    display: table;
                    width: 100vw;
                    height: 100vh;
                    table-layout: fixed;
                }

                #treeViewContainer {
                    display: table-cell;
                    width: 350px;
                    height: 100vh;
                    overflow-y: scroll;
                    overflow-x: hidden;
                    background-color: rgba(255, 255, 255, 0.2);
                    color: black;
                    padding-left: 10px;
                    font-family: 'Roboto', sans-serif;
                    font-size: 15px;
                    user-select: none;
                    -ms-user-select: none;
                    -moz-user-select: none;
                    -webkit-user-select: none;
                    vertical-align: top;
                }

                #canvasContainer {
                    display: table-cell;
                    height: 100vh;
                    vertical-align: top;
                }

                #myCanvas {
                    width: 100%;
                    height: 100%;
                }

                #treeViewContainer ul {
                    list-style: none;
                    padding-left: 1.75em;
                    pointer-events: none;
                }

                #treeViewContainer ul li {
                    position: relative;
                    width: 500px;
                    pointer-events: none;
                    padding-top: 3px;
                    padding-bottom: 3px;
                    vertical-align: middle;
                }

                #treeViewContainer ul li a {
                    background-color: #eee;
                    border-radius: 50%;
                    color: #000;
                    display: inline-block;
                    height: 1.5em;
                    left: -1.5em;
                    position: absolute;
                    text-align: center;
                    text-decoration: none;
                    width: 1.5em;
                    pointer-events: all;
                }

                #treeViewContainer ul li a.plus {
                    background-color: #ded;
                    pointer-events: all;
                }

                #treeViewContainer ul li a.minus {
                    background-color: #eee;
                    pointer-events: all;
                }

                #treeViewContainer ul li a:active {
                    top: 1px;
                    pointer-events: all;
                }

                #treeViewContainer ul li span:hover {
                    color: white;
                    cursor: pointer;
                    background: black;
                    padding-left: 2px;
                    pointer-events: all;
                }

                #treeViewContainer ul li span {
                    display: inline-block;
                    width: calc(100% - 50px);
                    padding-left: 2px;
                    pointer-events: all;
                    height: 23px;
                }

                #treeViewContainer .highlighted-node {
                    border: black solid 1px;
                    background: yellow;
                    color: black;
                    padding-left: 1px;
                    padding-right: 5px;
                    pointer-events: all;
                }

                .xeokit-context-menu {
                    font-family: 'Roboto', sans-serif;
                    font-size: 15px;
                    display: none;
                    z-index: 300000;
                    background: rgba(255, 255, 255, 0.46);
                    border: 1px solid black;
                    border-radius: 6px;
                    padding: 0;
                    width: 200px;
                }

                .xeokit-context-menu ul {
                    list-style: none;
                    margin-left: 0;
                    padding: 0;
                }

                .xeokit-context-menu-item {
                    list-style-type: none;
                    padding-left: 10px;
                    padding-right: 20px;
                    padding-top: 4px;
                    padding-bottom: 4px;
                    color: black;
                    background: rgba(255, 255, 255, 0.46);
                    cursor: pointer;
                    width: calc(100% - 30px);
                }

                .xeokit-context-menu-item:hover {
                    background: black;
                    color: white;
                    font-weight: normal;
                }

                .xeokit-context-menu-item span {
                    display: inline-block;
                }

                .xeokit-context-menu .disabled {
                    display: inline-block;
                    color: gray;
                    cursor: default;
                    font-weight: normal;
                }

                .xeokit-context-menu .disabled:hover {
                    color: gray;
                    cursor: default;
                    background: #eeeeee;
                    font-weight: normal;
                }

                .xeokit-context-menu-item-separator {
                    background: rgba(0, 0, 0, 1);
                    height: 1px;
                    width: 100%;
                }
                .xeokit-measurements-plugin-marker {
                    color: black;
                    position: absolute;
                    width: 25px;
                    height: 25px;
                    border-radius: 15px;
                    border: 2px solid black;
                    background: rgba(255, 255, 255, 0.8);
                    text-align: center;
                    font-family: Arial, sans-serif;
                    font-size: 15px;
                    padding-top: 2px;
                    pointer-events: none;
                }

                .xeokit-measurements-plugin-distance-label {
                    pointer-events: none;
                    position: absolute;
                    background: rgba(255, 255, 255, 0.8);
                    color: black;
                    font-family: Arial, sans-serif;
                    font-size: 15px;
                    padding: 5px;
                    border-radius: 5px;
                    border: 2px solid black;
                }
            `}</style>
        </div>
        </Card>
    );
}
