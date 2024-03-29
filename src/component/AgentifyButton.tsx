import React from 'react';
import "../styles/components.css"
export function AgentifyButton(props: { buttonText: string, onClick: () => void, primaryButton: boolean, isDisabled?: boolean }) {
    return (
        <button className={props.primaryButton ? "primaryButton" : "secondaryButton"} onClick={props.onClick} disabled={props.isDisabled}>{props.buttonText}</button>

    );
}