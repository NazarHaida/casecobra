"use client"

import {AspectRatio} from "@/components/ui/aspect-ratio";
import NextImage from 'next/image'
import {cn, formatPrice} from "@/lib/utils";
import {Rnd} from "react-rnd";
import HandleComponents from "@/components/HandleComponents";
import {ScrollArea} from "@/components/ui/scroll-area";
import {useRef, useState} from "react";
import {COLORS, FINISHES, MATERIALS, MODELS} from "@/validators/option-validators";
import {Label} from "@/components/ui/label";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {ArrowRight, Check, ChevronsUpDown} from "lucide-react";
import {RadioGroup, Field, Description} from "@headlessui/react";
import {BASE_PRICE} from "@/config/products";
import {useUploadThing} from "@/lib/uploadthing";
import {useMutation} from "@tanstack/react-query";
import {saveConfigProps, saveConfig as _saveConfig} from "@/app/configure/design/actions";
import {useRouter} from "next/navigation";

interface DesignConfiguratorProps {
    configId: string
    imageUrl: string
    imageDimentions: {
        width: number
        height: number
    }
}

const DesignConfigurator = ({configId, imageUrl, imageDimentions}: DesignConfiguratorProps) => {
    const router = useRouter()
    const {mutate: saveConfig} = useMutation({
        mutationKey: ["save-config"],
        mutationFn: async (args: saveConfigProps) => {
            await Promise.all([saveConfiguration(), _saveConfig(args)])
        },
        onError: (error) => {
            console.error(error)
        },
        onSuccess: () => {
            router.push(`/configure/preview?id=${configId}`)
        }
    })

    const [options, setOptions] = useState<{
        color: (typeof COLORS)[number]
        model: (typeof MODELS.options)[number]
        material: (typeof MATERIALS.options)[number]
        finish: (typeof FINISHES.options)[number]
    }>({
        color: COLORS[0],
        model: MODELS.options[0],
        material: MATERIALS.options[0],
        finish: FINISHES.options[0]
    });

    const [renderedDimensions, setRenderedDimensions] = useState({
        width: imageDimentions.width / 4,
        height: imageDimentions.height / 4,
    })

    const [renderedPosition, setRenderedPosition] = useState({
        x: 150,
        y: 205,
    })

    const phoneCaseRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const {startUpload} = useUploadThing("imageUploader");

    async function saveConfiguration() {
        try {
            const {left: caseLeft, top: caseTop, width, height} = phoneCaseRef.current!.getBoundingClientRect()
            const {left: containerLeft, top: containerTop} = containerRef.current!.getBoundingClientRect()
            const leftOffset = caseLeft - containerLeft
            const topOffset = caseTop - containerTop
            const actualX = renderedPosition.x - leftOffset
            const actualY = renderedPosition.y - topOffset

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext('2d');
            const image = new Image();
            image.crossOrigin = 'Anonymous';
            image.src = imageUrl;
            await new Promise(resolve => image.onload = resolve);
            context?.drawImage(
                image,
                actualX, actualY,
                renderedDimensions.width, renderedDimensions.height,
            );
            const base64 = canvas.toDataURL('image/png');
            const base64Data = base64.split(",")[1]

            const blob = base64ToBlob(base64Data, "image/png");
            const file = new File([blob], "filename.png", {type: "image/png"});

            await startUpload([file], {configId})
        } catch (error) {
            console.error(error);
        }
    }

    function base64ToBlob(base64: string, mimeType: string) {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);

        for (let sliceIndex = 0; sliceIndex < byteCharacters.length; sliceIndex++) {
            byteNumbers[sliceIndex] = byteCharacters.charCodeAt(sliceIndex);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], {type: mimeType});

    }

    return (
        <div className={"relative mt-20 grid lg:grid-cols-3 mb-20 pb-20 grid-cols-1"}>
            <div
                ref={containerRef}
                className={"relative h-[37.5rem] col-span-2 w-full max-2-4xl flex items-center overflow-hidden justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"}>
                <div className={"relative w-60 bg-opacity-50  aspect-[896/1831]"}>
                    <AspectRatio ratio={896 / 1831}
                                 ref={phoneCaseRef}
                                 className={" relative z-50 aspect-[896/1831] w-full"}>
                        <NextImage fill alt={"phone image"} src={"/phone-template.png"}
                                   className={" z-50 select-none"}/>
                    </AspectRatio>
                    <div
                        className={"absolute z-40 inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px] shadow-[0_0_0_99999px_rgba(229,231,235,0.6)]"}/>
                    <div className={cn(
                        'absolute inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px]', `bg-${options.color.tw}`
                    )}></div>
                </div>
                <Rnd
                    default={{
                        x: 150,
                        y: 205,
                        height: imageDimentions.height / 4,
                        width: imageDimentions.width / 4,
                    }}
                    onResizeStop={(_, __, ref, ___, {x, y}) => {
                        setRenderedDimensions({
                            height: parseInt(ref.style.height.slice(0, -2)),
                            width: parseInt(ref.style.width.slice(0, -2))
                        })
                        setRenderedPosition({x, y})
                    }}
                    onDragStop={(_, data) => {
                        const {x, y} = data
                        setRenderedPosition({x, y})
                    }}
                    lockAspectRatio
                    draggableComponent={{
                        bottomRight: <HandleComponents/>,
                        bottomLeft: <HandleComponents/>,
                        topLeft: <HandleComponents/>,
                        topRight: <HandleComponents/>
                    }}
                    className={"absolute z-20 border-[3px] border-primary"}
                >
                    <div className={"relative w-full h-full"}>
                        <NextImage fill alt={"phone image"} src={imageUrl} className={" "}/>
                    </div>
                </Rnd>
            </div>
            <div className={"h-[37rem] flex flex-col bg-white w-full col-span-full lg:col-span-1"}>
                <ScrollArea className={"relative flex-1 overflow-auto"}>
                    <div aria-hidden={true}
                         className={"absolute z-10 inset-x-0 bottom-0 h-12 bg-gradiant-to-t from-white "}/>
                    <div className={"px-8 pb-12 pt-8"}>
                        <h2 className={"tracking-tight font-bold text-3xl"}>
                            Customize your case
                        </h2>
                        <div className={"w-full h-px bg-zinc-200 my-6"}/>

                        <div className={"relative mt-4 h-full flex flex-col justify-between"}>
                            <div className={"flex flex-col gap-6"}>
                                <RadioGroup value={options.color} onChange={(value) => {
                                    setOptions((prev) => ({
                                        ...prev, color: value
                                    }))
                                }}>
                                    <Label>Color: {options.color.label}</Label>
                                    <div className={"mt-3 flex items-center space-x-3"}>
                                        {COLORS.map((color) => (
                                            <RadioGroup.Option
                                                key={color.label}
                                                value={color}
                                                className={({
                                                                active, checked
                                                            }) =>
                                                    cn("relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 active:ring-0 focus:ring-0 active:outline-none focus:outline-none border-2 border-transparent", {
                                                        [`border-${color.tw}`]: active || checked
                                                    })
                                                }><span
                                                className={cn(`bg-${color.tw}`, "h-8 w-8 rounded-full border border-black border-opacity-10")}></span></RadioGroup.Option>
                                        ))}
                                    </div>
                                </RadioGroup>
                                <div className={"relative flex flex-col gap-3 w-full"}>
                                    <Label>Model</Label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant={"outline"} role={"combobox"}
                                                    className={"w-full justify-between"}>
                                                {options.model.label}
                                                <ChevronsUpDown className={"ml-2 h-4 w-4 shrink-0 opacity-50"}/>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {MODELS.options.map((model) => (
                                                <DropdownMenuItem
                                                    key={model.label}
                                                    className={cn("flex text-sm gap-1 items-center p-1.5 cursor-default hover:bg-zinc-100", {"bg.zinc-100": model.label === options.model.label,})}
                                                    onClick={() => {
                                                        setOptions((prev) => ({...prev, model}))
                                                    }}>
                                                    <Check
                                                        className={cn("mr-2 h-4 w-4", model.label === options.model.label ? "opacity-100" : "opacity-0")}/>
                                                    {model.label}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                {[MATERIALS, FINISHES].map(({name, options: selectableOptions}) => (
                                    <RadioGroup
                                        key={name}
                                        value={options[name]}
                                        onChange={(val) => {
                                            setOptions((prev) => ({
                                                ...prev,
                                                [name]: val,
                                            }))
                                        }}>
                                        <Label>{name.slice(0, 1).toUpperCase() + name.slice(1)}</Label>
                                        <div className={"mt-3 space-y-4"}>
                                            {selectableOptions.map((option) => (
                                                <RadioGroup.Option value={option} className={({
                                                                                                  active,
                                                                                                  checked
                                                                                              }) => cn("relative block cursor-pointer rounded-lg bg-white px-6 py-4 shadow-sm border-2 border-zinc-200 focus:outline-none ring-0 focus:ring-0 outline-none sm:flex sm:justify-between", {
                                                    "border-primary": active || checked
                                                })} key={option.value}>
                                                <span className={"flex items-center"}>
                                                    <span className={"flex-col text-sm"}>
                                                        <RadioGroup.Label className={"font-medium text-gray-900"}
                                                                          as="span">
                                                            {option.label}
                                                        </RadioGroup.Label>
                                                        {option.description ?
                                                            <RadioGroup.Description className={"text-gray-500"}
                                                                                    as="span">
                                                                <span
                                                                    className={"block sm:inline"}>{option.description}</span>
                                                            </RadioGroup.Description>
                                                            : null
                                                        }
                                                    </span>
                                                </span>

                                                    <RadioGroup.Description as="span"
                                                                            className={"text-sm mt-2 sm:ml-4 sm:mt-0 sm:flex-col sm:text-right"}>
                                                        <span
                                                            className={"font-medium text-gray-900"}>{formatPrice(option.price / 1000)}</span>
                                                    </RadioGroup.Description>
                                                </RadioGroup.Option>
                                            ))}
                                        </div>
                                    </RadioGroup>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <div className='w-full px-8 h-16 bg-white'>
                    <div className='h-px w-full bg-zinc-200'/>
                    <div className='w-full h-full flex justify-end items-center'>
                        <div className='flex gap-6 items-center'>
                            <p className='font-medium whitespace-nowrap'>
                                {formatPrice(
                                    (BASE_PRICE + options.finish.price + options.material.price) /
                                    100
                                )}
                            </p>
                            <Button size={"sm"} onClick={() => saveConfig({
                                configId,
                                color: options.color.value,
                                model: options.model.value,
                                material: options.material.value,
                                finish: options.finish.value
                            })}>
                                Continue
                                <ArrowRight className='h-4 w-4 ml-1.5 inline'/>
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
export default DesignConfigurator;